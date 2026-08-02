function getRecentEpisodesRequest() {
    return "https://jkanime.net/";
}
function parseRecentEpisodes(html) {
    var results = [];
    var sectionMatch = /Programación([\s\S]*?)<div class="mi-boton-container">/.exec(html);
    var content = sectionMatch ? sectionMatch[1] : html;
    var regex = /<a[^>]+href=["']https?:\/\/jkanime\.net\/([^/"#?]+)\/(?:\d+\/)?["'][^>]*>(?:(?!<\/a>)[\s\S])*?<img[^>]+src=["']([^"']+)["'][^>]*>(?:(?!<\/a>)[\s\S])*?h5[^>]*>([^<]+)<\/h5>/gi;
    var match;
    while ((match = regex.exec(content)) !== null) {
        var slug = match[1];
        results.push({
            slug: slug,
            id: slug,
            url: "https://jkanime.net/" + slug + "/",
            title: match[3].trim(),
            thumbnail: match[2],
            type: "TV",
            status: "En emisión"
        });
    }
    return JSON.stringify(results);
}
function parseSearch(html) {
    var results = [];
    var itemRegex = /<div class="anime__item">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
    var itemMatch;
    while ((itemMatch = itemRegex.exec(html)) !== null) {
        var itemHtml = itemMatch[1];
        var slug = "", title = "", imgUrl = "", type = "TV", status = "Desconocido";
        var linkMatch = /href="([^"]+)"/i.exec(itemHtml);
        if (linkMatch) {
             slug = linkMatch[1].replace(/https?:\/\/jkanime\.net\//g, '').replace(/\//g, '');
        }
        var titleMatch = /<h5>\s*(?:<a[^>]*>)?([^<]*?)(?:<\/a>)?\s*<\/h5>/i.exec(itemHtml);
        if (titleMatch) title = titleMatch[1].trim();
        var imgMatch = /data-setbg="([^"]+)"/i.exec(itemHtml);
        if (imgMatch) imgUrl = imgMatch[1];
        var typeMatch = /<li>([^<]+)<\/li>/i.exec(itemHtml);
        if (typeMatch) type = typeMatch[1].trim();
        if (slug && title) {
            results.push({ slug: slug, id: slug, title: title, thumbnail: imgUrl, type: type, status: status, url: "https://jkanime.net/" + slug + "/" });
        }
    }
    return JSON.stringify(results);
}
function getAnimeDetailsRequest(url) {
    return url;
}
function parseAnimeDetails(html, url) {
    var detail = { genres: [] };
    var titleMatch = /<h3>([^<]+)<\/h3>/i.exec(html);
    if (titleMatch) detail.title = titleMatch[1].trim();
    var ogTitle = /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i.exec(html);
    if (!detail.title && ogTitle) detail.title = ogTitle[1].replace(" online - JKAnime", "").trim();
    var ogImg = /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i.exec(html);
    if (ogImg) detail.posterUrl = ogImg[1];
    var synMatch = /<p\s+[^>]*class=["']scroll["'][^>]*>([\s\S]*?)<\/p>/i.exec(html);
    if (synMatch) detail.synopsis = synMatch[1].replace(/<[^>]+>/g, "").trim();
    var typeMatch = /<li>\s*<span>Tipo:<\/span>([^<]+)<\/li>/i.exec(html);
    if (typeMatch) detail.type = typeMatch[1].trim();
    var statusMatch = /<li>\s*<span>Estado:<\/span>([^<]+)<\/li>/i.exec(html);
    if (statusMatch) detail.status = statusMatch[1].trim();
    var studioMatch = /<li>\s*<span>Studios:<\/span>([^<]+)<\/li>/i.exec(html);
    if (studioMatch) detail.studios = studioMatch[1].trim();
    var airedMatch = /<li>\s*<span>Emitido:<\/span>([^<]+)<\/li>/i.exec(html);
    if (airedMatch) detail.aired = airedMatch[1].trim();
    var idMatch = /(?:id=["']anime_id["']\s+value=["']|\/ajax\/episodes\/|votar\(["']|data-anime=["'])(\d+)/i.exec(html);
    if (idMatch) detail.animeId = idMatch[1];
    var genresMatch = /<li>\s*<span>Genero:<\/span>([\s\S]*?)<\/li>/i.exec(html);
    if (genresMatch) {
        var gHtml = genresMatch[1];
        var gRegex = /<a[^>]*>([^<]+)<\/a>/gi;
        var gM;
        while ((gM = gRegex.exec(gHtml)) !== null) {
            detail.genres.push(gM[1].trim());
        }
    }
    return JSON.stringify(detail);
}
function getEpisodesRequest(animeId, page) {
    return "https://jkanime.net/ajax/pagination_episodes/" + animeId + "/" + page + "/";
}
function parseEpisodes(responseString, animeId) {
    var arr = JSON.parse(responseString);
    var results = [];
    for (var i = 0; i < arr.length; i++) {
        var ep = arr[i];
        results.push({
            number: ep.number,
            title: "Episodio " + ep.number,
            url: "/" + animeId + "/" + ep.number + "/",
            imageUrl: ""
        });
    }
    return JSON.stringify(results);
}
function getSearchRequest(query, page) {
    return "https://jkanime.net/buscar/" + encodeURIComponent(query) + "/" + page + "/";
}
function parseSearch(html) {
    var results = [];
    var regex = /<a href="([^"]+)" title="([^"]+)"[^>]*>[\s\S]*?<img src="([^"]+)"[^>]*>[\s\S]*?<h6[^>]*>([\s\S]*?)<\/h6>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g;
    var match;
    while ((match = regex.exec(html)) !== null) {
        results.push({
            url: match[1],
            title: match[2].trim(),
            imageUrl: match[3],
            type: match[4].trim(),
            synopsis: match[5].trim().replace(/<[^>]*>?/gm, '')
        });
    }
    return JSON.stringify(results);
}
function getVideoServersRequest(url) {
    return url;
}
function parseVideoServers(html) {
    var servers = [];
    var scriptMatch = /<script[^>]*>\s*(var video = \[\];[\s\S]*?)<\/script>/.exec(html);
    var names = [];
    var namesRegex = /<a[^>]*data-id="[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
    var nameMatch;
    var nameAreaMatch = /<div class="anime__video__player__box">([\s\S]*?)<\/div>/.exec(html);
    if (nameAreaMatch) {
        while ((nameMatch = namesRegex.exec(nameAreaMatch[1])) !== null) {
            names.push(nameMatch[1].trim().replace(/<[^>]*>?/gm, ''));
        }
    }
    if (scriptMatch) {
        var scriptContent = scriptMatch[1];
        var videoRegex = /video\[(\d+)\] = '(.*?)';/g;
        var match;
        while ((match = videoRegex.exec(scriptContent)) !== null) {
            var index = parseInt(match[1]);
            var iframeHtml = match[2];
            var srcMatch = /src="([^"]+)"/.exec(iframeHtml);
            if (srcMatch) {
                var url = srcMatch[1];
                if (url.startsWith("//")) url = "https:" + url;
                var name = "Server " + index;
                if (index > 0 && index - 1 < names.length) {
                    name = names[index - 1];
                }
                servers.push({
                    name: name,
                    url: url
                });
            }
        }
    }
    return JSON.stringify(servers);
}