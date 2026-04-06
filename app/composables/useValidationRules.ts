export function useValidationRules() {
  const { t } = useI18n();
  const rules = ref({
    required: (v: any) => !!v || t("v.field_required"),
    requiredTrim: (v: any) => !!v.trim() || t("v.field_required"),
    requiredLocation: (v: any) => !!v || t("v.field_required_location"),
    arrayRequired: (v: any) =>
      (Array.isArray(v) && v.length > 0) || t("v.field_required"),
    invalidEmail: (v: any) => {
      const pattern =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return pattern.test(v) || t("v.invalid_email");
    },
    minChar: (v: any) => (v || "").length >= 8 || t("v.min_char"),
    isValidColor: (v: any) => {
      // Check if the value is a valid color string
      // This regular expression matches hex color codes, RGB/RGBA, and named colors
      if (v != "") {
        const colorRegex =
          /^(#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})|(rgb|rgba)\((\d+,\s*\d+,\s*\d+)(?:,\s*[\d.]+)?\)|([a-zA-Z]+))$/;

        // If the value is a valid color, return true
        // Otherwise, return the translation string "v.invalid_color"
        return colorRegex.test(v) || t("v.invalid_color");
      }
    },
    min1Char: (obj: any) => (v: any) =>
      !v ||
      v.length >= 1 ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.min_1char")
        : t("v.the") + " " + obj.label + " " + t("v.min_1char")
      }`,
    min1Number: (obj: any) => (v: any) =>
      !v ||
      (v !== null && v !== undefined && v !== "" && Number(v) > 0) ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.min_0char")
        : t("v.the") + " " + obj.label + " " + t("v.min_0char")
      }`,
    min2Char: (obj: any) => (v: any) =>
      !v ||
      v.length >= 2 ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.min_2char")
        : t("v.the") + " " + obj.label + " " + t("v.min_2char")
      }`,
    min3Char: (obj: any) => (v: any) =>
      !v ||
      v.length >= 3 ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.min_3char")
        : t("v.the") + " " + obj.label + " " + t("v.min_3char")
      }`,
    min8Char: (obj: any) => (v: any) =>
      !v ||
      v.length >= 8 ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.min_8char")
        : t("v.the") + " " + obj.label + " " + t("v.min_8char")
      }`,
    min10Char: (obj: any) => (v: any) =>
      !v ||
      v.length >= 10 ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.min_10char")
        : t("v.the") + " " + obj.label + " " + t("v.min_10char")
      }`,
    min6Char: (obj: any) => (v: any) =>
      !v ||
      v.length >= 6 ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.min_6char")
        : t("v.the") + " " + obj.label + " " + t("v.min_6char")
      }`,
    max_Char: (obj: any) => (v: any) =>
      !v ||
      v.length <= 50 ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.max_char")
        : t("v.the") + " " + obj.label + " " + t("v.max_char")
      }`,
    max20_Char: (obj: any) => (v: any) =>
      !v ||
      v.length <= 20 ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.max_20_char")
        : t("v.the") + " " + obj.label + " " + t("v.max_20_char")
      }`,
    max50_Char: (obj: any) => (v: any) =>
      !v ||
      v.length <= 50 ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.max_50_char")
        : t("v.the") + " " + obj.label + " " + t("v.max_50_char")
      }`,
    max100_Char: (obj: any) => (v: any) =>
      !v ||
      v.length <= 100 ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.max_100_char")
        : t("v.the") + " " + obj.label + " " + t("v.max_100_char")
      }`,
    max150_Char: (obj: any) => (v: any) =>
      !v ||
      v.length <= 150 ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.max_150_char")
        : t("v.the") + " " + obj.label + " " + t("v.max_150_char")
      }`,
    max500_Char: (obj: any) => (v: any) =>
      !v ||
      v.length <= 500 ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.max_500_char")
        : t("v.the") + " " + obj.label + " " + t("v.max_500_char")
      }`,
    max600_Char: (obj: any) => (v: any) =>
      !v ||
      v.length <= 600 ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.max_600_char")
        : t("v.the") + " " + obj.label + " " + t("v.max_600_char")
      }`,
    max200_Char: (obj: any) => (v: any) =>
      !v ||
      v.length <= 200 ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.max_200_char")
        : t("v.the") + " " + obj.label + " " + t("v.max_200_char")
      }`,
    max255_Char: (obj: any) => (v: any) =>
      !v ||
      v.length <= 255 ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.max_255_char")
        : t("v.the") + " " + obj.label + " " + t("v.max_255_char")
      }`,
    max1024Char: (obj: any) => (v: any) =>
      (v || "").length <= 1024 ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.max_1024_char")
        : t("v.the") + " " + obj.label + " " + t("v.max_1024_char")
      }`,
    max5000Char: (obj: any) => (v: any) =>
      (v || "").length <= 5000 ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.max_5000_char")
        : t("v.the") + " " + obj.label + " " + t("v.max_5000_char")
      }`,
    max1000Char: (obj: any) => (v: any) =>
      (v || "").length <= 1000 ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.max_1000_char")
        : t("v.the") + " " + obj.label + " " + t("v.max_1000_char")
      }`,

    onlyCapitalLettersAndNumbers: (v: any) => {
      if (!v) return true; // Let 'required' rule handle empty input

      const validChars = /^[A-Z0-9]+$/.test(v); // Only A-Z and 0-9
      const hasLetter = /[A-Z]/.test(v); // At least one letter
      const hasNumber = /[0-9]/.test(v); // At least one number

      if (!validChars) return t("v.only_capital_letters_and_numbers");
      if (!hasLetter || !hasNumber)
        return t("v.only_capital_letters_and_numbers");

      return true;
    },

    hasCapitalLetter: (v: any) => /[A-Z]/.test(v) || t("v.capital_letter"),
    hasSmallLetter: (v: any) => /[a-z]/.test(v) || t("v.small_letter"),
    hasOneNumber: (v: any) => /\d/.test(v) || t("v.one_number"),
    specialChar: (v: any) =>
      /[!@#$%^&*(),.?":{}|<>]/.test(v) || t("v.special_char"),
    onlyChars: (obj: any) => (v: any) =>
      !v ||
      /^[A-Za-z\u0600-\u06FF\s.-]+$/.test(v) ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.only_chars")
        : t("v.the") + " " + obj.label + " " + t("v.only_chars")
      }`,
    onlyEnChars: (obj: any) => (v: any) =>
      !v ||
      /^[A-Za-z0-9\s!@#$%&*\\/\-{}\\[\]()_:.,?!<>"';|،+=`~^]+$/.test(v) ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.only_en_chars")
        : t("v.the") + " " + obj.label + " " + t("v.only_en_chars")
      }`,
    onlyArChars: (obj: any) => (v: any) =>
      !v ||
      /^[\u0600-\u06FF0-9\s!@#$%&*\\/\-{}\\[\]()_:.,?!<>"';|،+=`~^]+$/.test(
        v,
      ) ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.only_ar_chars")
        : t("v.the") + " " + obj.label + " " + t("v.only_ar_chars")
      }`,
    onlyArabicLetters: (v: any) =>
      !v ||
      /^[\u0600-\u06FF0-9\s!@#$%&*\\/\-{}\[\]()_:.,?!<>"';|،+=`~^]+$/.test(v) ||
      t("v.only_arabic_letters"),
    onlyEnglishLetters: (v: any) =>
      !v ||
      /^[A-Za-z0-9\s!@#$%&*\\/\-{}\[\]()_:.,?!<>"';|،+=`~^]+$/.test(v) ||
      t("v.only_english_letters"),
    max_150_Char: (obj: any) => (v: any) =>
      (v || "").length <= 150 ||
      `${obj.locale === "ar"
        ? t("v.field") + " " + obj.label + " " + t("v.max_150_char")
        : t("v.the") + " " + obj.label + " " + t("v.max_150_char")
      }`,
    max_mg: (obj: any) => (v: any) =>
      obj.size < 2 * 1024 * 1024 || `less than 2 mg`,
    max_file_size_3mb: () => (v: File | null) => {
      if (!v) return true;
      return v.size <= 3 * 1024 * 1024 || t("v.max_size_3mb");
    },
    max_file_size_3mb_multiple: () => (v: File[] | null) => {
      if (!v || v.length === 0) return true;
      return (
        v.every((file) => file.size <= 3 * 1024 * 1024) || t("v.max_size_3mb")
      );
    },
    validLinkediInUrl: (v: any) => {
      const linkedInUrlPattern = (v || "").includes(
        "https://www.linkedin.com/",
      );
      const linkedInUrlPattern2 = (v || "").includes("www.linkedin.com/");

      return (
        (!linkedInUrlPattern && !linkedInUrlPattern2) || t("v.invalid_linl")
      );
    },
    matchPassword: (obj: any) => (v: any) =>
      v === obj.label || t("v.match_password"),

    validXUrl: (v: any) => {
      const xUrlPattern = (v || "").includes("https://www.x.com/");
      const xUrlPattern2 = (v || "").includes("www.x.com/");

      return (!xUrlPattern && !xUrlPattern2) || t("v.invalid_linl");
    },

    onlyNumbers: (v: any) => {
      const numericRegex = /^\d+$/;
      return numericRegex.test(v) || t("v.must_be_number");
    },
    greaterThanZero: (v: any) => v > 0 || t("v.greaterThanZero"),
    maxValue: (maxValue: number) => (v: any) =>
      !v || Number(v) <= maxValue || t("v.cannot_exceed_global_usage_limit"),
    minNum: (v: any) => v >= 1 || t("v.min_seats"),
    maxNum: (v: any) => v <= 1000 || t("v.max_seats"),
  });

  return { rules };
}
