import { ACTIVITY_LABELS } from "../constants";
import type { ActivityType } from "../types";

export const getActivityLabel = (type: ActivityType) => ACTIVITY_LABELS[type];
