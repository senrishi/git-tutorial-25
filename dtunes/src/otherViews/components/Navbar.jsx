
export default function Navbar({pageHeading='Creation Panel'}){

    return(
        <div className="Navbar w-full border-b-2 border-gray-800 px-5 sm:px-12 py-6 mb-4 text-lg">
            <p className="text-blue-800 text-3xl text-center">{pageHeading}</p>
        </div>
    )
}