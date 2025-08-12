export default function DisplaySongsUsers({ children, heading }) {
    //for displaying either songs or users
    return (
        <div className="mb-4">
            <h1 className="my-5 font-bold text-2xl">{heading}</h1>
            <div className="flex flex-wrap justify-evenly overflow-auto">
                {children}
            </div>
        </div>
    )
}