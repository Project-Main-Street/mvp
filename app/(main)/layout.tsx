import NavBar from "@/lib/components/NavBar";


export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <NavBar />
            {children}
        </>
    )
}
