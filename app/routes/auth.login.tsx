import { ActionFunctionArgs } from "@remix-run/node";
import { Form, json, redirect, useActionData } from "@remix-run/react";
import { z } from "zod";
import { zx } from "zodix";
import { TYPES } from "~/core.server/infrastructure";
import { container } from "~/core.server/inversify.config";
import { IAuthentication } from "~/core.server/services/auth.service";
import { commitSession, getSession } from "~/session";

export const action = async ({ request }: ActionFunctionArgs) => {
  const auth = container.get<IAuthentication>(TYPES.AuthService) 
  const session = await getSession(
    request.headers.get("Cookie")
  );

  const { email, password } = await zx.parseForm(request, {
    email: z.string().email(),
    password: z.string(),
  });
    try {
    const token = await auth.login(email, password)
    session.set('token', token)
  } catch {
    return json({
      error: 'The email or the password do not match'
    })
  } 

    
  throw redirect('/', { 
    headers: {
      "Set-Cookie": await commitSession(session),
    }
  })
}



export default function Index() {
  const actionData = useActionData<typeof action>()
  
  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl">Login</h1>
      <div>
        { actionData?.error }
      </div>
      <Form method="POST">
      <input type="email" name="email" placeholder="email" id="" />
        <input type="password" name="password" placeholder="password" id="" />
        <button>
          Submit
        </button>
      </Form>
    </div>
  );
}
