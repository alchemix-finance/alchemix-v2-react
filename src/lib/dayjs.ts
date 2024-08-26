import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import duration from "dayjs/plugin/duration";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.extend(duration);

export { dayjs };
