"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
];

export default function LanguageSwitcher({
  variant = "outline",
  size = "icon",
}: {
  variant?: "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}) {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null);

  // Xác định ngôn ngữ hiện tại khi component khởi tạo
  useEffect(() => {
    const lang = languages.find((lang) => lang.code === i18n.language);
    setCurrentLanguage(lang || languages[0]);
  }, [i18n.language]);

  // Hàm thay đổi ngôn ngữ
  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    const newLang = languages.find((lang) => lang.code === languageCode);
    setCurrentLanguage(newLang || null);

    // Lưu ngôn ngữ vào localStorage
    localStorage.setItem("i18nextLng", languageCode);
  };

  if (!currentLanguage) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className="w-9 px-0"
          aria-label="Change language"
        >
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={i18n.language === language.code ? "bg-accent" : ""}
          >
            <span className="mr-2">{language.flag}</span>
            {language.nativeName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
