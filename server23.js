function getRecentEpisodesRequest(baseUrl) {
    if (!baseUrl) baseUrl = "https://jkanime.net";
    return baseUrl + "/";
}

function parseRecentEpisodes(html, baseUrl) {
    if (!baseUrl) baseUrl = "https://jkanime.net";
    var results = [];
    var sectionMatch = /Programación([\s\S]*?)<div class="mi-boton-container">/.exec(html);
    var content = sectionMatch ? sectionMatch[1] : html;
    
    var regex = /<a[^>]+href=["'](https?:\/\/[^\/]+)?\/([^/"#?]+)\/(?:\d+\/)?["'][^>]*>(?:(?!<\/a>)[\s\S])*?<img[^>]+src=["']([^"']+)["'][^>]*>(?:(?!<\/a>)[\s\S])*?h5[^>]*>([^<]+)<\/h5>/gi;
    var match;
    while ((match = regex.exec(content)) !== null) {
        var slug = match[2];
        results.push({
            slug: slug,
            id: slug,
            url: baseUrl + "/" + slug + "/",
            title: match[4].trim(),
            thumbnail: match[3],
            type: "TV",
            status: "En emisión"
        });
    }
    return JSON.stringify(results);
}

function getSearchRequest(baseUrl, query, page) {
    if (!baseUrl) baseUrl = "https://jkanime.net";
    return baseUrl + "/buscar/" + encodeURIComponent(query) + "/" + page + "/";
}

function parseSearch(html, baseUrl) {
    if (!baseUrl) baseUrl = "https://jkanime.net";
    var results = [];
    var itemRegex = /<div class="anime__item">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
    var itemMatch;
    while ((itemMatch = itemRegex.exec(html)) !== null) {
        var itemHtml = itemMatch[1];
        var slug = "", title = "", imgUrl = "", type = "TV", status = "Desconocido";
        var linkMatch = /href="([^"]+)"/i.exec(itemHtml);
        if (linkMatch) {
              slug = linkMatch[1].replace(/https?:\/\/[^\/]+\//g, '').replace(/\//g, '');
        }
        var titleMatch = /<h5>\s*(?:<a[^>]*>)?([^<]*?)(?:<\/a>)?\s*<\/h5>/i.exec(itemHtml);
        if (titleMatch) title = titleMatch[1].trim();
        var imgMatch = /data-setbg="([^"]+)"/i.exec(itemHtml);
        if (imgMatch) imgUrl = imgMatch[1];
        var typeMatch = /<li>([^<]+)<\/li>/i.exec(itemHtml);
        if (typeMatch) type = typeMatch[1].trim();
        
        if (slug && title) {
            results.push({ 
                slug: slug, 
                id: slug, 
                title: title, 
                thumbnail: imgUrl, 
                type: type, 
                status: status, 
                url: baseUrl + "/" + slug + "/" 
            });
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

function getEpisodesRequest(baseUrl, animeId, page) {
    if (!baseUrl) baseUrl = "https://jkanime.net";
    return baseUrl + "/ajax/episodes/" + animeId + "/" + page + "/";
}

function parseEpisodes(responseString, slug) {
    var results = [];
    try {
        var obj = JSON.parse(responseString);
        var arr = obj.data || obj.episodes || obj.ep || obj;
        
        if (!Array.isArray(arr)) { 
            arr = [arr]; 
        }
        
        for (var i = 0; i < arr.length; i++) {
            var ep = arr[i];
            if (!ep) continue;
            var num = ep.number || ep.id || (i + 1);
            results.push({
                number: num,
                title: "Episodio " + num,
                url: "/" + slug + "/" + num + "/",
                imageUrl: ""
            });
        }
    } catch(e) {
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

// ==========================================
// NUEVAS FUNCIONES DE FILTROS DINÁMICOS
// ==========================================

function getFiltersRequest(baseUrl) {
    if (!baseUrl) baseUrl = "https://jkanime.net";
    return baseUrl + "/directorio/";
}

function parseFilters(html) {
    var filters = { genres: [], types: [], statuses: [], languages: [] };
    
    // Parsear géneros (y sacar idioma "latino" si existe en las opciones)
    var genreSelectMatch = /<select name="genero">([\s\S]*?)<\/select>/.exec(html);
    if (genreSelectMatch) {
        var optionsRegex = /<option value=['"]([^'"]+)['"][^>]*>([^<]+)<\/option>/gi;
        var match;
        while ((match = optionsRegex.exec(genreSelectMatch[1])) !== null) {
            if (match[1] === "latino") {
                filters.languages.push({ id: match[1], name: match[2].trim() });
            } else {
                filters.genres.push({ id: match[1], name: match[2].trim() });
            }
        }
    }
    
    // Parsear tipos (TV, Ovas, Películas, etc.)
    var typeSelectMatch = /<select name="tipo">([\s\S]*?)<\/select>/.exec(html);
    if (typeSelectMatch) {
        var optionsRegex = /<option[^>]*value=["']([^"']+)["'][^>]*>([^<]+)<\/option>/gi;
        var match;
        while ((match = optionsRegex.exec(typeSelectMatch[1])) !== null) {
            filters.types.push({ id: match[1], name: match[2].trim() });
        }
    }
    
    // Parsear estados (En emisión, finalizado, etc.)
    var statusSelectMatch = /<select name="estado">([\s\S]*?)<\/select>/.exec(html);
    if (statusSelectMatch) {
        var optionsRegex = /<option[^>]*value=["']([^"']+)["'][^>]*>([^<]+)<\/option>/gi;
        var match;
        while ((match = optionsRegex.exec(statusSelectMatch[1])) !== null) {
            filters.statuses.push({ id: match[1], name: match[2].trim() });
        }
    }
    
    return JSON.stringify(filters);
}

function getFilterRequest(baseUrl, query, genre, type, status, page) {
    if (!baseUrl) baseUrl = "https://jkanime.net";
    
    // Si no hay filtros seleccionados, hacer una búsqueda normal
    if (!genre && !type && !status) {
        if (!query) query = "";
        return baseUrl + "/buscar/" + encodeURIComponent(query) + "/" + (page || 1) + "/";
    }
    
    // Búsqueda por directorio usando los filtros
    var url = baseUrl + "/directorio/?";
    if (genre) url += "genero=" + genre + "&";
    if (type) url += "tipo=" + type + "&";
    if (status) url += "estado=" + status + "&";
    
    return url;
}
