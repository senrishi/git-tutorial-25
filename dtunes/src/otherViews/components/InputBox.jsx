

export default function InputBox({onChangeSet, value, placeholder='', inputType='text', label}) {
    return (
        <div className="flex flex-col gap-2.5">
            <p>{label}</p>
            <input onChange={(e) => onChangeSet(e.target.value)} value={value} className={inputType!=='color' ? `bg-transparent focus:bg-blue-100 outline-green-600 border-2 border-gray-400 hover:border-green-500 p-2.5 w-[max(40vw,250px)]` : ''} placeholder={placeholder} type={inputType} />
        </div>
    )
}