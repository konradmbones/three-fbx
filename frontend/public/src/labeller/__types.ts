export type ThumbButton = "up" | "down";
export type ThumbsState = "up" | "down" | "None";
export type TrackType = "segment" | "event";
export type LabellingStatus = "completed" | "in_progress" | "-";

export interface Label {
    deleted: boolean,
    author: string,
    label_text: string,
    label_start_percent: number | null,
    label_end_percent: number | null,
    label_start_frame: number   | null,
    label_end_frame: number | null,
    label_num_frames: number | null,
    created_at_datetime: string,
    thumbs: { [author: string]: ThumbButton },
    label_type: string,
    track_type: TrackType,
    event_percents: number[] | null,
};

export interface LabelsImport {
    MOVE_org_name: string,
    move_num_frames: number | null,
    timeline_labels: { [no: string]: Label },
    general_labels: GeneralLabels
    created_at_datetime: string
};

export interface LabelsExport {
    new_timeline_labels: { [key: string]: Label },
    move_num_frames: number
};

export interface GeneralLabels{
    labelling_status: LabellingStatus,
}

export interface AnimFeedback {
    move_org_name: string,
    author: string,
    created_at_datetime: string,
    feedback: string,
    category: string
}



