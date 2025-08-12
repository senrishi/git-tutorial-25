import * as cheerio from 'cheerio';
import axios from 'axios';

async function getSongLyrics(songName) {
    try {
        let axiosResponse = await axios.get(`https://api.genius.com/search?q=${encodeURIComponent(songName)}`, {
            headers: {
                'Authorization': `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`,
            }
        });

        axiosResponse = axiosResponse.data;
        if (axiosResponse.meta.status !== 200) return { success: false, response: axiosResponse };

        const hits = axiosResponse.response.hits;
        const hit = hits.find(h => h.type === 'song');
        if (!hit) return { success: false, message: 'no songs, other types' };

        let lyricsPath = hit.result.path;
        if (!lyricsPath) return { success: false, message: 'no lyrics path' };

        let apiTitle = hit.result.full_title.trim().toLowerCase();
        let givenTitle = songName.trim().toLowerCase();

        if (givenTitle.indexOf(apiTitle) === -1 && apiTitle.indexOf(givenTitle) === -1){
            return {success: false, errorCode: 'noMatch'};
        }

        lyricsPath = 'https://genius.com' + lyricsPath;

        const lyricsResponse = await axios.get(lyricsPath, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
            }
        });

        if(lyricsResponse.status !== 200) return res.json({success: false, lyricsResponse})

        const $ = cheerio.load(lyricsResponse.data);
        const div = $('div[data-lyrics-container="true"]');
        $.prototype.getText = function(){
            this.find('br').replaceWith('\n');
            return this.text();
        }

        return {success: true, lyrics: div.getText()};


    } catch (err) {
        console.log(err);
        return { success: false, message: 'unknown error' }
    }

}

export {getSongLyrics};