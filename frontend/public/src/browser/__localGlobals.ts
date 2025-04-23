import {BrowserType} from "./__types"
import {g} from "../globals.ts"
import { isForClientMode } from "../helpers.ts"

export const lg: {
    ISPROCESSINGFILTER: boolean,
    QUERY: string,
    SORTBYDATE: boolean,
    PAGE: number,
    PERPAGE: number,
    MAXPAGES: number,
    VERSION: string,
    CONTROLLER: AbortController | null,
    SIGNAL: AbortSignal | null,
    CASE_INSENSITIVE: boolean,
    DATE_FROM: string,
    DATE_TO: string,
    REGEX_ON: boolean,
    DIRPATH: string,
    BROWSER_TYPE: BrowserType,
    QUERY_BASEPATH: string,
    SOURCE: "localpaths" | "mongo"
} = {
    ISPROCESSINGFILTER: false,
    QUERY: "",
    SORTBYDATE: false,
    PAGE: 1,
    PERPAGE: 1000,
    MAXPAGES: 1,
    VERSION: "v1",
    CONTROLLER: null,
    SIGNAL: null,
    CASE_INSENSITIVE: false,
    DATE_FROM: "",
    DATE_TO: "",
    REGEX_ON: true,
    DIRPATH: "",
    BROWSER_TYPE: g.DEFAULT_BROWSER_MODE,
    // #v-ifdef PROD
    QUERY_BASEPATH: "/mnt/user/prigplay/OUTPUT/ALL_DATA/anims_uniform/v016",
    // #v-endif
    // #v-ifdef DEV
    // @ts-ignore
    QUERY_BASEPATH: "/mnt/user/prigplay/OUTPUT/",
    SOURCE: "mongo"
    // #v-endif
}

if (isForClientMode()) {
    lg.QUERY_BASEPATH = "/mnt/user/prigplay/OUTPUT/DATASETS/Gen1/NVIDIA__v016__240912/HARDLINKS/anims_uniform/"
}