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
      <Section size="3" className="py-16 md:py-24">
        <Container>
          <div className="flex flex-col items-center justify-center text-center gap-6 max-w-3xl mx-auto">
            <Heading size="9" className="font-bold">
              Project Main Street
            </Heading>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
              A fiduciary for small business operators and a community resource platform built around trust, designed to uphold quality and credibility.
            </p>
            <div className="flex gap-4 mt-4 justify-center">
              <a 
                href="/sign-up" 
                className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Get Started
              </a>
              <a 
                href="/sign-in" 
                className="inline-block px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Sign In
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
