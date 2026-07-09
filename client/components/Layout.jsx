import Header from "./Header";

export default function Layout({ children }) {
    return (
        <>
            <Header />
            <main className="d-flex"> {children} </main>
        </>
    )
}