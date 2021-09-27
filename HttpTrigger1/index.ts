import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {
  InteractionType,
  InteractionResponseType,
  verifyKey,
} from "discord-interactions";
//import fetch from "node-fetch";
import axios from "axios";

const CLIENT_PUBLIC_KEY = process.env.CLIENT_PUBLIC_KEY;
const STARTURL = process.env.STARTURL;
const STOPURL = process.env.STOPURL;

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const sig = req.headers["x-signature-ed25519"];
  const time = req.headers["x-signature-timestamp"];
  const isValid = await verifyKey(req.rawBody, sig, time, CLIENT_PUBLIC_KEY);

  if (!isValid) {
    context.res = {
      status: 401,
      Headers: {},
      body: "",
    };
    return;
  }

  const interaction = req.body;
  if (interaction && interaction.type === InteractionType.APPLICATION_COMMAND) {
    const action = req.body.data.options[0].value;
    const username = req.body.member.user.username;

    if (action == "start") {
      axios.get(STARTURL);
      //fetch(STARTURL);

      context.res = {
        status: 200,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `hi ${username}, server ${action}. connect minecraft server few minutes later.`,
          },
        }),
      };

    } else if (action == "stop") {
      axios.get(STOPURL);
      //fetch(STOPURL);
      
      context.res = {
        status: 200,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `server ${action} in few minutes.`,
          },
        }),
      };

    } else if(action == "test"){
      context.res = {
        status: 200,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `${action}, by ${username}`,
          },
        }),
      };
    }

  } else {
    context.res = {
      body: JSON.stringify({
        type: InteractionResponseType.PONG,
      }),
    };
  }
};

export default httpTrigger;