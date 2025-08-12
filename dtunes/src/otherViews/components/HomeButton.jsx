export default function SubmitButton({text = 'Back To Home'}){
    return(
        <a href="/"><button className="mt-8 ml-2 mb-2 text-base bg-red-600 hover:bg-red-700 active:bg-red-800 text-white cursor-pointer px-6 py-3 rounded-full" type="submit">{text}</button></a>
    )
}