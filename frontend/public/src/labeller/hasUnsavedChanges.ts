import { getNewTracks } from "./__localHelpers"

export function hasUnsavedChanges() {
    return getNewTracks().length > 0
}