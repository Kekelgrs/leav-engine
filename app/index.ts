import fs from "fs";
import Crypto from "crypto";
import amqp from "amqplib/callback_api";
import { Options, Connection, Channel } from "amqplib";
import { start } from "./watch/watch";
import { Config } from "./types";

const configPathArg = process.argv[2];
const configPath = configPathArg ? configPathArg : "./config/config.json";

const rawConfig = fs.readFileSync(configPath);
const config: Config = JSON.parse(rawConfig.toString());

const rootKey =
  config.rootKey ||
  Crypto.createHash("md5")
    .update(config.rootPath)
    .digest("hex");

if (config.amqp) {
  const amqpConfig: Options.Connect = {
    protocol: config.amqp.protocol,
    hostname: config.amqp.hostname,
    username: config.amqp.username,
    password: config.amqp.password,
  };

  const exchange = config.amqp.exchange;
  const queue = config.amqp.queue;
  const routingKey = config.amqp.routingKey;

  amqp.connect(
    amqpConfig,
    async (error0: any, connection: Connection | any) => {
      // Connection is not compatible with Connection?
      if (error0) {
        throw error0;
      }

      try {
        const channel: Channel = await connection.createChannel();

        await channel.assertExchange(exchange, "direct", { durable: true });
        await channel.assertQueue(queue, { durable: true });

        await channel.bindQueue(queue, exchange, routingKey);

        let watchParams = {};
        if (config.watcher && config.watcher.awaitWriteFinish) {
          watchParams = config.watcher.awaitWriteFinish;
        }

        start(
          config.rootPath,
          config.verbose,
          rootKey,
          {
            channel,
            exchange,
            routingKey,
          },
          watchParams,
        );
      } catch (e) {
        process.exit(1);
      }
    },
  );
} else {
  start(config.rootPath, config.verbose, rootKey);
}
