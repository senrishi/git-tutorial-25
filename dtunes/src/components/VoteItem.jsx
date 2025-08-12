
export default function VoteItem({ pD }) {
    return (
        <div className={`grid grid-cols-[2fr_1fr_1fr] gap-2 p-2 items-center text-[#a7a7a7] ${pD.userVoted && 'bg-green-900'}`}>
            <p className="text-white">
                <img className="inline w-10 mr-5" src={pD.image} alt={pD.name} />
                {pD.name}
            </p>

            <p className="text-[15px] text-center md:block">
                {`${pD.songs.length} songs`}
            </p>

            <p className="text-[15px] text-center">
                {`${pD.votes} votes`}
            </p>

        </div>
    )
}