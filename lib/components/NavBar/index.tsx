import Link from "next/link";
import { NavigationMenu } from "radix-ui";
import "./styles.css";

export default function NavBar() {
    return (
        <NavigationMenu.Root className="NavigationMenu">
            <NavigationMenu.List className="NavigationMenuList">
                <NavigationMenu.Item className="NavigationMenuItem">
                    <NavigationMenu.Link asChild className="NavigationMenuLink">
                        <Link href="/">Project Main Street</Link>
                    </NavigationMenu.Link>
                </NavigationMenu.Item>

                <NavigationMenu.Item className="NavigationMenuItem">
                    <NavigationMenu.Link asChild className="NavigationMenuLink">
                        <Link href="/sign-in">Sign In</Link>
                    </NavigationMenu.Link>
                </NavigationMenu.Item>

                <NavigationMenu.Item className="NavigationMenuItem">
                    <NavigationMenu.Link asChild className="NavigationMenuLink">
                        <Link href="/sign-up">Sign Up</Link>
                    </NavigationMenu.Link>
                </NavigationMenu.Item>

                <NavigationMenu.Item className="NavigationMenuItem">
                    <NavigationMenu.Link asChild className="NavigationMenuLink">
                        <Link href="/dashboard">Dashboard</Link>
                    </NavigationMenu.Link>
                </NavigationMenu.Item>

                <NavigationMenu.Indicator className="NavigationMenuIndicator" />
            </NavigationMenu.List>

            <NavigationMenu.Viewport className="NavigationMenuViewport" />
        </NavigationMenu.Root>
    )
}
