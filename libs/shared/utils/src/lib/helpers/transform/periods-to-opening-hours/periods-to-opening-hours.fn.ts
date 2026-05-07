export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

type PeriodDate = {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
};

type TimePoint = {
  day: IsoWeekday; // ISO: 1=lundi ... 7=dimanche
  hour: number; // 0-23
  minute: number; // 0-59
  date: PeriodDate;
};

type Period = {
  open: TimePoint;
  close: TimePoint;
};

type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type OpeningHours = Record<
  DayKey,
  Array<{ open: Date; close: Date }> | null
>;

const ISO_TO_DAYKEY: Record<IsoWeekday, DayKey> = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
  7: "sunday",
};

function makeLocalDate(d: PeriodDate, hour: number, minute: number) {
  return new Date(d.year, d.month - 1, d.day, hour, minute);
}

export function buildOpeningHours(periods: Period[]): OpeningHours {
  const result: OpeningHours = {
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null,
  };

  const buckets: Record<DayKey, Array<{ open: Date; close: Date }>> = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };

  for (const p of periods ?? []) {
    const { open, close } = p;
    if (!open || !close) {
      continue;
    }
    if (open.day !== close.day) {
      continue;
    }
    const dayKey = ISO_TO_DAYKEY[open.day as IsoWeekday];
    if (!dayKey) {
      continue;
    }

    const openDate = makeLocalDate(open.date, open.hour, open.minute);
    const closeDate = makeLocalDate(close.date, close.hour, close.minute);
    if (isNaN(openDate.getTime()) || isNaN(closeDate.getTime())) {
      continue;
    }
    if (closeDate <= openDate) {
      continue;
    }

    buckets[dayKey].push({ open: openDate, close: closeDate });
  }

  (Object.keys(buckets) as DayKey[]).forEach((k) => {
    const slots = buckets[k].sort((a, b) => +a.open - +b.open);
    result[k] = slots.length ? slots : null;
  });

  return result;
}

/* ---------- New helpers ---------- */

const DAY_KEYS_ORDER: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAYS_FR: Record<DayKey, string> = {
  monday: "lundi",
  tuesday: "mardi",
  wednesday: "mercredi",
  thursday: "jeudi",
  friday: "vendredi",
  saturday: "samedi",
  sunday: "dimanche",
};

function formatTimeForLabel(d: Date) {
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) {
    return "";
  }
  const h = date.getHours();
  const m = date.getMinutes();
  if (m === 0) {
    return `${h}h`;
  }
  // if minutes not 0 -> show e.g. 9h30
  return `${h}h${String(m).padStart(2, "0")}`;
}

function slotsToString(slots: Array<{ open: Date; close: Date }>) {
  // Multiple slots on same day: "9h – 12h, 14h – 18h"
  return slots
    .map(
      (s) => `${formatTimeForLabel(s.open)} – ${formatTimeForLabel(s.close)}`,
    )
    .join(", ");
}

/**
 * Format opening hours grouping consecutive days that share identical slots.
 * Example output:
 * "Du lundi au vendredi : 9h – 18h\nSamedi : Fermé\nDimanche : Fermé"
 */
export function formatOpeningHours(openingHours?: OpeningHours | null): string {
  if (!openingHours) {
    return "Non communiqué";
  }

  // Build comparable representation per day (string or "Fermé")
  const perDay = DAY_KEYS_ORDER.map((k) => {
    const slots = openingHours[k];
    return {
      key: k,
      label: slots === null ? "Fermé" : slotsToString(slots),
    };
  });

  // Group consecutive days with identical label
  const groups: Array<{ from: DayKey; to: DayKey; label: string }> = [];
  let i = 0;
  while (i < perDay.length) {
    const start = perDay[i];
    if (!start) {
      i++;
      continue;
    }
    let j = i + 1;
    while (j < perDay.length && perDay[j]?.label === start.label) {
      j++;
    }
    const last = perDay[j - 1];
    if (!last) {
      i = j;
      continue;
    }
    groups.push({
      from: start.key,
      to: last.key,
      label: start.label,
    });
    i = j;
  }

  // Format groups to lines; if group label === "Fermé" and spans >1 day, expand per-day
  const lines: string[] = [];
  for (const g of groups) {
    const fromIndex = DAY_KEYS_ORDER.indexOf(g.from);
    const toIndex = DAY_KEYS_ORDER.indexOf(g.to);

    if (g.label === "Fermé" && fromIndex < toIndex) {
      // expand: one line per day
      for (let idx = fromIndex; idx <= toIndex; idx++) {
        const dayKey = DAY_KEYS_ORDER[idx];
        const dayName = dayKey ? capitalizeFirst(DAYS_FR[dayKey]) : "";
        lines.push(`${dayName} : Fermé`);
      }
    } else {
      // normal formatting (single day or grouped open hours)
      const fromName = DAYS_FR[g.from];
      const toName = DAYS_FR[g.to];
      const dayPart =
        g.from === g.to
          ? capitalizeFirst(fromName)
          : `Du ${fromName} au ${toName}`;
      const content = g.label === "Fermé" ? "Fermé" : g.label;
      lines.push(`${dayPart} : ${content}`);
    }
  }

  return lines.join("\n");
}

function capitalizeFirst(s: string) {
  if (!s) {
    return s;
  }
  return s[0] ? s[0].toUpperCase() + s.slice(1) : "";
}

/**
 * Returns "Ouvert" if current local time is inside any of today's slots, otherwise "Fermé".
 * If openingHours is not provided or today is null -> "Fermé".
 */
export function currentStatus(
  openingHours?: OpeningHours | null,
): "Ouvert" | "Fermé" {
  if (!openingHours) {
    return "Fermé";
  }

  const now = new Date();
  // getDay: 0 (Sunday) .. 6 (Saturday)
  const jsDay = now.getDay(); // 0..6
  // map to our DayKey: jsDay 1->monday ... 0->sunday
  const dayKey: DayKey = (
    jsDay === 0 ? "sunday" : DAY_KEYS_ORDER[jsDay - 1]
  ) as DayKey;

  const todaySlots = openingHours[dayKey];
  if (!todaySlots || todaySlots.length === 0) {
    return "Fermé";
  }

  // If any slot contains now -> open
  const nowUtc = new Date(Date.now());
  for (const s of todaySlots) {
    const open = new Date(s.open);
    const close = new Date(s.close);
    if (open <= nowUtc && nowUtc < close) {
      return "Ouvert";
    }
  }

  return "Fermé";
}
