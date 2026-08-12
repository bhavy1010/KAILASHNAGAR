/**
 * Extracts 11-character YouTube Video ID from any standard YouTube URL or raw ID string.
 *
 * @param {string} url
 * @returns {string|null} 11-character video ID, or null if invalid.
 */
const extractYoutubeVideoId = (url) => {
    if (!url || typeof url !== "string") return null;

    const trimmed = url.trim();

    // Raw 11-char ID format check
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
        return trimmed;
    }

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = trimmed.match(regExp);

    if (match && match[2].length === 11) {
        return match[2];
    }

    return null;
};

module.exports = {
    extractYoutubeVideoId
};
