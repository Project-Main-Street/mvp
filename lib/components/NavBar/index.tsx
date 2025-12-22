'use client';

import { NavigationMenu } from "radix-ui";
import { Link, Strong } from "@radix-ui/themes";
import "./styles.scss";
import { UserButton, useUser } from "@stackframe/stack";

export default function NavBar() {
    const user = useUser();
    return (
        <NavigationMenu.Root className="NavigationMenu-Root">
            <NavigationMenu.List className="NavigationMenu-List">
                <NavigationMenu.Item>
                    <NavigationMenu.Link asChild>
                        <Link href="/">
                            <Strong>Main Street</Strong>
                        </Link>
                    </NavigationMenu.Link>
                </NavigationMenu.Item>

                {user ? (
                    <div className="right group">
                        <NavigationMenu.Item>
                            <UserButton />
                        </NavigationMenu.Item>
                    </div>
                ) : (
                    <div className="right group">
                        <NavigationMenu.Item>
                            <NavigationMenu.Link asChild>
                                <Link href="/sign-in">
                                    Sign In
                                </Link>
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>

                        <NavigationMenu.Item>
                            <NavigationMenu.Link asChild>
                                <Link href="/sign-up">
                                    Sign Up
                                </Link>
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                    </div>
                )}

                <NavigationMenu.Indicator />
            </NavigationMenu.List>

            <NavigationMenu.Viewport />
        </NavigationMenu.Root>
    )
}
