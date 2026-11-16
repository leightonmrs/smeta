"use strict";
let currentLanguage = "ru";
const translations = {
  "Смета за 5 минут": {
    "ru": "Смета за 5 минут",
    "kk": "5 минутта смета",
    "en": "Estimate in 5 minutes"
  },
  "Добавьте позиции и цены — смета посчитает всё сама.": {
    "ru": "Добавьте позиции и цены — смета посчитает всё сама.",
    "kk": "Позициялар мен бағаларды енгізіңіз — смета автоматты түрде есептеледі.",
    "en": "Add items and prices — totals update automatically."
  },
  "Реквизиты": {
    "ru": "Реквизиты",
    "kk": "Деректемелер",
    "en": "Details"
  },
  "От кого": {
    "ru": "От кого",
    "kk": "Кімнен",
    "en": "From"
  },
  "Для кого": {
    "ru": "Для кого",
    "kk": "Кімге",
    "en": "To"
  },
  "Номер сметы": {
    "ru": "Номер сметы",
    "kk": "Смета нөмірі",
    "en": "Estimate number"
  },
  "Дата": {
    "ru": "Дата",
    "kk": "Күні",
    "en": "Date"
  },
  "Ваше имя или компания": {
    "ru": "Ваше имя или компания",
    "kk": "Атыңыз немесе компанияңыз",
    "en": "Your name or company"
  },
  "Клиент или организация": {
    "ru": "Клиент или организация",
    "kk": "Клиент немесе ұйым",
    "en": "Client or organization"
  },
  "Например, 001": {
    "ru": "Например, 001",
    "kk": "Мысалы, 001",
    "en": "For example, 001"
  },
  "Позиции": {
    "ru": "Позиции",
    "kk": "Позициялар",
    "en": "Items"
  },
  "Наименование": {
    "ru": "Наименование",
    "kk": "Атауы",
    "en": "Description"
  },
  "Количество": {
    "ru": "Количество",
    "kk": "Саны",
    "en": "Quantity"
  },
  "Единица": {
    "ru": "Единица",
    "kk": "Өлшем бірлігі",
    "en": "Unit"
  },
  "Цена": {
    "ru": "Цена",
    "kk": "Бағасы",
    "en": "Price"
  },
  "Сумма": {
    "ru": "Сумма",
    "kk": "Сомасы",
    "en": "Subtotal"
  },
  "Удаление": {
    "ru": "Удаление",
    "kk": "Жою",
    "en": "Delete"
  },
  "Позиция удалена": {
    "ru": "Позиция удалена",
    "kk": "Позиция жойылды",
    "en": "Item deleted"
  },
  "Вернуть": {
    "ru": "Вернуть",
    "kk": "Қайтару",
    "en": "Undo"
  },
  "+ Добавить позицию": {
    "ru": "+ Добавить позицию",
    "kk": "+ Позиция қосу",
    "en": "+ Add item"
  },
  "Скидка, %": {
    "ru": "Скидка, %",
    "kk": "Жеңілдік, %",
    "en": "Discount, %"
  },
  "НДС, %": {
    "ru": "НДС, %",
    "kk": "ҚҚС, %",
    "en": "VAT, %"
  },
  "Валюта": {
    "ru": "Валюта",
    "kk": "Валюта",
    "en": "Currency"
  },
  "Скидка": {
    "ru": "Скидка",
    "kk": "Жеңілдік",
    "en": "Discount"
  },
  "Сумма со скидкой": {
    "ru": "Сумма со скидкой",
    "kk": "Жеңілдіктен кейінгі сома",
    "en": "Subtotal after discount"
  },
  "НДС": {
    "ru": "НДС",
    "kk": "ҚҚС",
    "en": "VAT"
  },
  "Итого к оплате": {
    "ru": "Итого к оплате",
    "kk": "Төленетін жалпы сома",
    "en": "Total due"
  },
  "Комментарий": {
    "ru": "Комментарий",
    "kk": "Түсініктеме",
    "en": "Comment"
  },
  "Комментарий: сроки, условия оплаты": {
    "ru": "Комментарий: сроки, условия оплаты",
    "kk": "Түсініктеме: мерзімдер, төлем шарттары",
    "en": "Comment: deadlines and payment terms"
  },
  "Сроки, условия оплаты": {
    "ru": "Сроки, условия оплаты",
    "kk": "Мерзімдер, төлем шарттары",
    "en": "Deadlines and payment terms"
  },
  "Подпись ____________________": {
    "ru": "Подпись ____________________",
    "kk": "Қолы ____________________",
    "en": "Signature ____________________"
  },
  "Сохранить PDF": {
    "ru": "Сохранить PDF",
    "kk": "PDF сақтау",
    "en": "Save PDF"
  },
  "Скопировать для WhatsApp": {
    "ru": "Скопировать для WhatsApp",
    "kk": "WhatsApp үшін көшіру",
    "en": "Copy for WhatsApp"
  },
  "Новая смета": {
    "ru": "Новая смета",
    "kk": "Жаңа смета",
    "en": "New estimate"
  },
  "Сохранить в архив": {
    "ru": "Сохранить в архив",
    "kk": "Мұрағатқа сақтау",
    "en": "Save to archive"
  },
  "Скопируйте текст вручную": {
    "ru": "Скопируйте текст вручную",
    "kk": "Мәтінді қолмен көшіріңіз",
    "en": "Copy the text manually"
  },
  "Архив смет": {
    "ru": "Архив смет",
    "kk": "Сметалар мұрағаты",
    "en": "Estimate archive"
  },
  "Резервная копия": {
    "ru": "Резервная копия",
    "kk": "Сақтық көшірме",
    "en": "Backup"
  },
  "Скачать резервную копию": {
    "ru": "Скачать резервную копию",
    "kk": "Сақтық көшірмені жүктеп алу",
    "en": "Download backup"
  },
  "Загрузить резервную копию": {
    "ru": "Загрузить резервную копию",
    "kk": "Сақтық көшірмені қалпына келтіру",
    "en": "Restore backup"
  },
  "Товар или услуга": {
    "ru": "Товар или услуга",
    "kk": "Тауар немесе қызмет",
    "en": "Product or service"
  },
  "Дублировать": {
    "ru": "Дублировать",
    "kk": "Көшірмесін жасау",
    "en": "Duplicate"
  },
  "Удалить позицию": {
    "ru": "Удалить позицию",
    "kk": "Позицияны жою",
    "en": "Delete item"
  },
  "шт": {
    "ru": "шт",
    "kk": "дана",
    "en": "pcs"
  },
  "час": {
    "ru": "час",
    "kk": "сағат",
    "en": "hour"
  },
  "услуга": {
    "ru": "услуга",
    "kk": "қызмет",
    "en": "service"
  },
  "Введите корректное число": {
    "ru": "Введите корректное число",
    "kk": "Дұрыс сан енгізіңіз",
    "en": "Enter a valid number"
  },
  "Введите процент от 0 до 100": {
    "ru": "Введите процент от 0 до 100",
    "kk": "0 мен 100 аралығындағы пайызды енгізіңіз",
    "en": "Enter a percentage from 0 to 100"
  },
  "Введите число не меньше 0": {
    "ru": "Введите число не меньше 0",
    "kk": "0-ден кем емес сан енгізіңіз",
    "en": "Enter a number of 0 or more"
  },
  "Браузер не разрешает сохранить черновик. Не закрывайте страницу, пока не сохраните смету.": {
    "ru": "Браузер не разрешает сохранить черновик. Не закрывайте страницу, пока не сохраните смету.",
    "kk": "Браузер нобайды сақтауға рұқсат бермейді. Сметаны сақтағанша бетті жаппаңыз.",
    "en": "The browser cannot save the draft. Keep this page open until you save the estimate."
  },
  "Не удалось восстановить черновик из памяти браузера.": {
    "ru": "Не удалось восстановить черновик из памяти браузера.",
    "kk": "Браузер жадынан нобайды қалпына келтіру мүмкін болмады.",
    "en": "Could not restore the draft from browser storage."
  },
  "Создать новую смету? Текущий черновик будет очищен.": {
    "ru": "Создать новую смету? Текущий черновик будет очищен.",
    "kk": "Жаңа смета жасалсын ба? Ағымдағы нобай тазаланады.",
    "en": "Create a new estimate? The current draft will be cleared."
  },
  "Без наименования": {
    "ru": "Без наименования",
    "kk": "Атаусыз",
    "en": "Untitled item"
  },
  "Скопировано ✓": {
    "ru": "Скопировано ✓",
    "kk": "Көшірілді ✓",
    "en": "Copied ✓"
  },
  "Неверный формат архива": {
    "ru": "Неверный формат архива",
    "kk": "Мұрағат пішімі дұрыс емес",
    "en": "Invalid archive format"
  },
  "Не удалось прочитать или сохранить архив в памяти браузера. Данные архива не заменены.": {
    "ru": "Не удалось прочитать или сохранить архив в памяти браузера. Данные архива не заменены.",
    "kk": "Мұрағатты браузер жадынан оқу немесе сақтау мүмкін болмады. Мұрағат деректері ауыстырылған жоқ.",
    "en": "Could not read or save the archive. Archive data was not replaced."
  },
  "Открыть смету из архива? Текущий черновик будет заменён.": {
    "ru": "Открыть смету из архива? Текущий черновик будет заменён.",
    "kk": "Мұрағаттағы смета ашылсын ба? Ағымдағы нобай ауыстырылады.",
    "en": "Open the archived estimate? The current draft will be replaced."
  },
  "Смета открыта из архива.": {
    "ru": "Смета открыта из архива.",
    "kk": "Смета мұрағаттан ашылды.",
    "en": "Estimate opened from archive."
  },
  "В архиве пока нет смет.": {
    "ru": "В архиве пока нет смет.",
    "kk": "Мұрағатта әзірге смета жоқ.",
    "en": "No archived estimates yet."
  },
  "Открыть": {
    "ru": "Открыть",
    "kk": "Ашу",
    "en": "Open"
  },
  "Удалить": {
    "ru": "Удалить",
    "kk": "Жою",
    "en": "Delete"
  },
  "Смета удалена из архива.": {
    "ru": "Смета удалена из архива.",
    "kk": "Смета мұрағаттан жойылды.",
    "en": "Estimate deleted from archive."
  },
  "Смета сохранена в архив.": {
    "ru": "Смета сохранена в архив.",
    "kk": "Смета мұрағатқа сақталды.",
    "en": "Estimate saved to archive."
  },
  "Неверный файл резервной копии или неподдерживаемая версия. Данные не изменены.": {
    "ru": "Неверный файл резервной копии или неподдерживаемая версия. Данные не изменены.",
    "kk": "Сақтық көшірме файлы дұрыс емес немесе нұсқасы қолдау таппайды. Деректер өзгерген жоқ.",
    "en": "Invalid backup file or unsupported version. Data was not changed."
  },
  "Резервная копия подготовлена к скачиванию.": {
    "ru": "Резервная копия подготовлена к скачиванию.",
    "kk": "Сақтық көшірме жүктеп алуға дайын.",
    "en": "Backup ready to download."
  },
  "Не удалось создать резервную копию. Проверьте доступность и данные архива.": {
    "ru": "Не удалось создать резервную копию. Проверьте доступность и данные архива.",
    "kk": "Сақтық көшірме жасау мүмкін болмады. Мұрағаттың қолжетімділігі мен деректерін тексеріңіз.",
    "en": "Could not create a backup. Check archive access and data."
  },
  "Ошибка памяти браузера при восстановлении прежних данных. Текущая смета осталась на экране; скачайте резервную копию перед обновлением страницы.": {
    "ru": "Ошибка памяти браузера при восстановлении прежних данных. Текущая смета осталась на экране; скачайте резервную копию перед обновлением страницы.",
    "kk": "Бұрынғы деректерді қалпына келтіру кезінде браузер жадының қатесі орын алды. Ағымдағы смета экранда қалды; бетті жаңартпас бұрын сақтық көшірмені жүктеп алыңыз.",
    "en": "Browser storage failed while restoring previous data. The current estimate remains on screen; download a backup before refreshing."
  },
  "Не удалось сохранить резервную копию в браузере. Прежние данные сохранены.": {
    "ru": "Не удалось сохранить резервную копию в браузере. Прежние данные сохранены.",
    "kk": "Сақтық көшірмені браузерде сақтау мүмкін болмады. Бұрынғы деректер сақталды.",
    "en": "Could not store the backup in the browser. Previous data was preserved."
  },
  "Не удалось прочитать JSON-файл. Данные не изменены.": {
    "ru": "Не удалось прочитать JSON-файл. Данные не изменены.",
    "kk": "JSON файлын оқу мүмкін болмады. Деректер өзгерген жоқ.",
    "en": "Could not read the JSON file. Data was not changed."
  },
  "Загрузить резервную копию? Текущий черновик и весь архив будут заменены.": {
    "ru": "Загрузить резервную копию? Текущий черновик и весь архив будут заменены.",
    "kk": "Сақтық көшірме қалпына келтірілсін бе? Ағымдағы нобай мен бүкіл мұрағат ауыстырылады.",
    "en": "Restore backup? The current draft and entire archive will be replaced."
  },
  "Загрузка отменена. Данные не изменены.": {
    "ru": "Загрузка отменена. Данные не изменены.",
    "kk": "Жүктеу тоқтатылды. Деректер өзгерген жоқ.",
    "en": "Import cancelled. Data was not changed."
  },
  "Резервная копия загружена. Черновик и архив восстановлены.": {
    "ru": "Резервная копия загружена. Черновик и архив восстановлены.",
    "kk": "Сақтық көшірме жүктелді. Нобай мен мұрағат қалпына келтірілді.",
    "en": "Backup imported. Draft and archive restored."
  },
  "Язык сметы": {
    "ru": "Язык сметы",
    "kk": "Смета тілі",
    "en": "Estimate language"
  }
};

function t(key) { return translations[key]?.[currentLanguage] || key; }
function validLanguage(value) { return value === undefined || ["ru", "kk", "en"].includes(value); }
function locale() { return {ru: "ru-RU", kk: "kk-KZ", en: "en-GB"}[currentLanguage]; }
function localizedDate(value) {
  return value ? new Intl.DateTimeFormat(locale(), {day: "numeric", month: "long", year: "numeric", timeZone: "UTC"}).format(new Date(`${value}T00:00:00Z`)) : "—";
}
function estimateHeading(number, date) {
  const n = number || "—", day = localizedDate(date);
  return {ru: `Смета № ${n} от ${day}`, kk: `Смета № ${n}, ${day}`, en: `Estimate No. ${n} dated ${day}`}[currentLanguage];
}
function deleteArchiveQuestion(number) {
  return {ru: `Удалить смету № ${number} из архива?`, kk: `№ ${number} сметаны мұрағаттан жою керек пе?`, en: `Delete estimate No. ${number} from the archive?`}[currentLanguage];
}
// Only marked interface nodes are translated; user content is never traversed.
function translateTree(root) {
  root.querySelectorAll("[data-i18n]").forEach(node => { node.textContent = t(node.dataset.i18n); });
  for (const attr of ["placeholder", "aria-label", "data-label"]) {
    root.querySelectorAll(`[data-i18n-${attr}]`).forEach(node => node.setAttribute(attr, t(node.getAttribute(`data-i18n-${attr}`))));
  }
}
function setLanguage(language) {
  const statuses = ["#copy-status", "#storage-status", "#archive-status", "#backup-status"].map(selector => {
    const node = document.querySelector(selector);
    const key = Object.keys(translations).find(key => Object.values(translations[key]).includes(node.textContent));
    return {node, key};
  });
  currentLanguage = language || "ru";
  statuses.forEach(({node, key}) => { if (key) node.textContent = t(key); });
  document.documentElement.lang = currentLanguage;
  document.title = t("Смета за 5 минут");
  document.querySelector("#language").value = currentLanguage;
  translateTree(document);
}
