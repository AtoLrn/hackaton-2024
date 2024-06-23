import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ActionFunctionArgs,  redirect } from "@remix-run/node";
import { Form, json, useActionData } from "@remix-run/react";
import { z } from "zod";
import { zx } from "zodix";
import { User } from "~/core.server/entities/user.entity";
import { TYPES } from "~/core.server/infrastructure";
import { container } from "~/core.server/inversify.config";
import { IUserRepository } from "~/core.server/repositories/user.repository";
import { IBcrypt } from "~/core.server/services/bcrypt.service";

export const action = async ({ request }: ActionFunctionArgs) => {
  const userRepository = container.get<IUserRepository>(TYPES.UserRepository)
  const bcrypt = container.get<IBcrypt>(TYPES.BcryptService)

  const { email, password } = await zx.parseForm(request, {
    email: z.string().email(),
    password: z.string(),
  });

  const user = new User(
    undefined,
    email,
    await bcrypt.hash(password),
    ''
  )
try {
  await userRepository.create(user)

} catch (e) {

  if (e instanceof PrismaClientKnownRequestError) {
    return json({
      error: 'This email is already registered'
    })
  }

  throw e
}

  throw redirect('/')
}

export default function Index() {
  const actionData = useActionData<typeof action>()
  
  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl">Register</h1>
      <div>
        { actionData?.error }
      </div><Form method="POST">
        <input type="email" name="email" placeholder="email" id="" />
        <input type="password" name="password" placeholder="password" id="" />
        <button>
          Submit
        </button>
      </Form>
    </div>
  );
}
