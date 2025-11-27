import { Language } from "./translations";

export const getExpenseCategories = (t: (key: string) => string) => [
  t('catAffitto'),
  t('catBollette'),
  t('catSpesa'),
  t('catTrasporti'),
  t('catSalute'),
  t('catSvago'),
  t('catAltro'),
];

export const getBudgetExpenseCategories = (t: (key: string) => string) => [
  t('catCasaServizi'),
  t('catServiziFin'),
  t('catAlimentari'),
  t('catSvago'),
  t('catTrasporti'),
  t('catFigli'),
  t('catAltro'),
];

export const getBudgetIncomeCategories = (t: (key: string) => string) => [
  t('catStipendioPensione'),
  t('catRedditiFam'),
  t('catInvestimentiFin'),
  t('catInvestimentiImm'),
  t('catAltro'),
];

export const getFrequencies = (t: (key: string) => string) => [
  { value: "weekly", label: t('catSettimanale'), multiplier: 52 },
  { value: "monthly", label: t('catMensile'), multiplier: 12 },
  { value: "bimonthly", label: t('catBimestrale'), multiplier: 6 },
  { value: "quarterly", label: t('catTrimestrale'), multiplier: 4 },
  { value: "semiannual", label: t('catSemestrale'), multiplier: 2 },
  { value: "annual", label: t('catAnnuale'), multiplier: 1 }
];
