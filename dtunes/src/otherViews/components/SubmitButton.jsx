
export default function SubmitButton({text}){
    return(
        <button className="text-base bg-green-600 hover:bg-green-700 active:bg-green-800 text-white cursor-pointer px-6 py-3 rounded-full" type="submit">{text}</button>
    )
}