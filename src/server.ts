import "dotenv/config";
import http from "http";
import UserStorage, { ClusterMsg } from "./userStorage";
import { User } from "./user";
import ServerAnswer from "./serverAnswer";
import cluster from "cluster";
import { availableParallelism } from "os";
import BalanceLoad from "./loadBalancer";

let processStorage = cluster.isWorker && process.env.STORAGE ? new UserStorage(JSON.parse(process.env.STORAGE)) : new UserStorage([]);

function getBody(req: http.IncomingMessage) {
  const promise: Promise<string> = new Promise<string>((resolve, reject) => {
    const body: any = [];
    req
      .on("error", (err) => {
        reject(err);
      })
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        resolve(Buffer.concat(body).toString());
      });
  });
  return promise;
}

function isUser(user: User) {
  return user.username && user.age;
}
function isUUID(uuid: string) {
  return /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(
    uuid
  );
}

const isClusterized = process.argv.includes("--clusterize");
const applicationPort =
  isClusterized && cluster.isWorker
    ? process.env.CLUSTER_PORT
    : process.env.PORT;
// Cluster creation
if (isClusterized && cluster.isPrimary) {
  const cpus = availableParallelism();
  for (let i = 0; i < cpus; i++) {
    const worker = cluster.fork({
      CLUSTER_PORT: process.env.PORT ? +process.env.PORT + i + 1 : 3000 + i + 1,
      STORAGE: JSON.stringify(processStorage.getAllUsers()),
    });
    worker.on("message", (msg: ClusterMsg | null) => {
      if (msg && msg.storage) {
        processStorage = new UserStorage(msg.storage);
        for (const id in cluster.workers) {
          cluster.workers[id]?.send({ storage: msg.storage } as ClusterMsg);
        }
      } else {
        worker.send({ storage: processStorage.getAllUsers() } as ClusterMsg);
      }
    });
  }
}
if (cluster.isWorker) {
  process.on("message", (msg: ClusterMsg) => {
    processStorage = new UserStorage(msg.storage);
  });
}

async function handleConnection(
  req: http.IncomingMessage,
  res: http.ServerResponse
) {  
  if (cluster.isWorker) {
    res.on("close", () => {
      if (process.send)
        process.send({ storage: processStorage.getAllUsers() } as ClusterMsg);
    });
  }

  const answerManager = new ServerAnswer(res);
  if (!req.url) return;
  if (/^\/api\/users(\/.)?/.test(req.url)) {
    // /api/users GET call handler
    const arg = req.url.split("/")[3];
    if (!arg && req.method === "GET") {
      const users = processStorage.getAllUsers();
      answerManager.OK(JSON.stringify(users));
      return;
    } else if (req.method === "GET") {
      // /api/users/{userID} GET call handler
      if (!isUUID(arg)) {
        answerManager.BadRequest("Invalid UUID");
        return;
      }
      const user = processStorage.getUser(arg);
      if (user) {
        answerManager.OK(JSON.stringify(user));
      } else {
        answerManager.NotFound("User not found!");
      }
      return;
    } else if (!arg && req.method === "POST") {
      // /api/users/ POST call handler
      const user : User = JSON.parse(await getBody(req));
      if (isUser(user)) {
        if (!user.id || !isUUID(user.id)) {
          user.id = undefined
        }
        processStorage.push(user as User);
        answerManager.Created(JSON.stringify(processStorage.getAllUsers()));
        return;
      } else {
        answerManager.BadRequest("Invalid user object provided");
        return;
      }
    } else if (req.method === "PUT") {
      // /api/users/{userID} PUT call handler
      const newUser = JSON.parse(await getBody(req));
      if (!isUUID(arg)) answerManager.BadRequest("Invalid UUID provided");
      if (isUser(newUser)) {
        if (processStorage.editUser(arg, newUser as User)) {
          answerManager.OK(JSON.stringify(processStorage.getAllUsers()));
        } else {
          answerManager.NotFound("User with this id not found");
        }
      } else {
        answerManager.BadRequest("Invalid user object provided");
      }
      return;
    } else if (req.method === "DELETE") {
      // /api/users/{userID} DELETE call handler
      if (!isUUID(arg)) {
        answerManager.BadRequest("Invailid UUID provided");
      } else {
        if (processStorage.rmUser(arg)) {
          answerManager.NoContent();
        } else {
          answerManager.NotFound("User with this UUID not found");
        }
      }
      return;
    }
  }
  answerManager.NotImplemented();
}

export const server = http
  .createServer(cluster.isWorker || !isClusterized ? handleConnection : BalanceLoad)
  .listen(applicationPort, () => {
    console.log(
      `server is live on adress: http://localhost:${applicationPort}/`
    );
  });
