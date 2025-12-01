import { Container, Heading, Section } from "@radix-ui/themes";

import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";


export default async function Home() {
  const user = await stackServerApp.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main>
      <Section>
        <Container>
          <Heading>Nothing here, yet</Heading>
          <p>This is a placeholder for future content.</p>
        </Container>
      </Section>
    </main>
  );
}
