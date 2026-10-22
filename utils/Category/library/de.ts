import { CategoryRuleDirection } from '@/types-enums'

import { defineLibraryPack } from '../definition'

/**
 * Germany.
 */
export const dePack = defineLibraryPack({
  id: 'de',
  libraryKeywords: [
    // Income
    {
      id: 'child_benefit',
      name: 'Kindergeld',
      tag: 'benefits',
      keywords: ['Kindergeld', 'Familienkasse'],
      direction: CategoryRuleDirection.IN,
      examples: ['Familienkasse Kindergeld 123FK456789'],
    },
    {
      id: 'employment_agency',
      name: 'Bundesagentur für Arbeit',
      tag: 'benefits',
      keywords: ['Bundesagentur für Arbeit', 'Bundesagentur fuer Arbeit'],
      direction: CategoryRuleDirection.IN,
      examples: ['Bundesagentur fuer Arbeit Leistungen'],
    },
    {
      id: 'pension',
      name: 'Deutsche Rentenversicherung',
      tag: 'pension',
      keywords: ['Deutsche Rentenversicherung', 'DRV Bund'],
      direction: CategoryRuleDirection.IN,
      examples: ['Deutsche Rentenversicherung Rente 04/26'],
    },

    // Housing
    {
      id: 'stadtwerke',
      name: 'Stadtwerke',
      tag: 'utilities',
      keywords: ['Stadtwerke'],
      examples: ['Stadtwerke Musterstadt Abschlag Strom'],
    },
    {
      id: 'vattenfall',
      name: 'Vattenfall',
      tag: 'energy',
      keywords: ['VATTENFALL'],
      examples: ['Vattenfall Europe Sales GmbH Abschlag'],
    },
    {
      id: 'enbw',
      name: 'EnBW',
      tag: 'energy',
      keywords: ['ENBW'],
      examples: ['EnBW Energie Baden-Wuerttemberg AG'],
    },
    {
      id: 'property_tax',
      name: 'Grundsteuer',
      tag: 'property_tax',
      keywords: ['Grundsteuer'],
      examples: ['Stadtkasse Grundsteuer 2. Quartal'],
    },
    {
      id: 'broadcasting_fee',
      name: 'Rundfunkbeitrag',
      tag: 'broadcasting_fee',
      keywords: ['Rundfunk ARD', 'Beitragsservice', 'Rundfunkbeitrag'],
      examples: ['Rundfunk ARD, ZDF, DRadio 123456789'],
    },
    {
      id: 'obi',
      name: 'OBI',
      tag: 'diy',
      keywords: ['OBI'],
      examples: ['OBI Markt 123'],
    },
    {
      id: 'hornbach',
      name: 'Hornbach',
      tag: 'diy',
      keywords: ['HORNBACH'],
      examples: ['HORNBACH BAUMARKT AG 123'],
    },
    {
      id: 'bauhaus',
      name: 'Bauhaus',
      tag: 'diy',
      keywords: ['BAUHAUS'],
      examples: ['BAUHAUS 1234//BERLIN/DE'],
    },
    {
      id: 'toom',
      name: 'toom',
      tag: 'diy',
      keywords: ['TOOM'],
      examples: ['TOOM BAUMARKT 123'],
    },
    {
      id: 'hagebau',
      name: 'hagebau',
      tag: 'diy',
      keywords: ['HAGEBAU', 'HAGEBAUMARKT'],
      examples: ['hagebaumarkt Musterstadt'],
    },
    {
      id: 'herkules',
      name: 'Herkules',
      tag: 'diy',
      keywords: ['HERKULES'],
      examples: ['HERKULES BAU UND GARTEN'],
    },

    // Telecom
    {
      id: 'telekom',
      name: 'Telekom',
      tag: 'telecom',
      keywords: ['TELEKOM'],
      examples: ['Telekom Deutschland GmbH Rechnung'],
    },
    {
      id: 'o2',
      name: 'O2 (Telefónica)',
      tag: 'mobile',
      keywords: ['Telefonica Germany'],
      examples: ['Telefonica Germany GmbH Co. OHG'],
    },
    {
      id: 'one_and_one',
      name: '1&1',
      tag: 'telecom',
      keywords: ['1&1 Telecom', '1und1'],
      examples: ['1&1 Telecom GmbH'],
    },
    {
      id: 'congstar',
      name: 'congstar',
      tag: 'mobile',
      keywords: ['CONGSTAR'],
      examples: ['congstar GmbH'],
    },

    // Groceries
    {
      id: 'rewe',
      name: 'REWE',
      tag: 'supermarket',
      keywords: ['REWE'],
      examples: ['REWE Markt GmbH//Berlin/DE', 'REWE SAGT DANKE 4711'],
    },
    {
      id: 'edeka',
      name: 'EDEKA',
      tag: 'supermarket',
      keywords: ['EDEKA'],
      examples: ['EDEKA Center 1234'],
    },
    {
      id: 'penny',
      name: 'PENNY',
      tag: 'supermarket',
      keywords: ['PENNY'],
      examples: ['PENNY FIL. 1234'],
    },
    {
      id: 'netto',
      name: 'Netto',
      tag: 'supermarket',
      // "Netto" alone is also "net", e.g. in salary statements
      keywords: ['NETTO MARKEN-DISCOUNT', 'NETTO FILIALE', 'NETTO CITY'],
      examples: ['NETTO MARKEN-DISCOUNT 1234//KOELN', 'visa netto Marken-Discount'],
    },
    {
      id: 'kaufland',
      name: 'Kaufland',
      tag: 'supermarket',
      keywords: ['KAUFLAND'],
      examples: ['Kaufland 1234 Muenchen'],
    },
    {
      id: 'norma',
      name: 'NORMA',
      tag: 'supermarket',
      keywords: ['NORMA'],
      examples: ['NORMA 1234'],
    },
    {
      id: 'tegut',
      name: 'tegut',
      tag: 'supermarket',
      keywords: ['TEGUT'],
      examples: ['tegut... gute Lebensmittel'],
    },
    {
      id: 'alnatura',
      name: 'Alnatura',
      tag: 'supermarket',
      keywords: ['ALNATURA'],
      examples: ['ALNATURA 123'],
    },
    {
      id: 'denns',
      name: "denn's Biomarkt",
      tag: 'supermarket',
      keywords: ['DENNS BIOMARKT', "DENN'S BIOMARKT"],
      examples: ['DENNS BIOMARKT 123'],
    },
    {
      id: 'bakery',
      name: 'Bäckerei',
      tag: 'bakery',
      keywords: ['BÄCKEREI', 'BAECKEREI', 'BACKEREI', 'BACKWERK'],
      examples: ['Baeckerei Mustermann', 'BACKWERK 123'],
    },

    // Food
    {
      id: 'lieferando',
      name: 'Lieferando',
      tag: 'food_delivery',
      keywords: ['LIEFERANDO'],
      examples: ['Lieferando.de 1234'],
    },

    // Transport
    {
      id: 'aral',
      name: 'Aral',
      tag: 'fuel',
      keywords: ['ARAL'],
      examples: ['ARAL Station 1234'],
    },
    {
      id: 'jet',
      name: 'JET',
      tag: 'fuel',
      keywords: ['JET TANKSTELLE', 'JET DEUTSCHLAND'],
      examples: ['JET TANKSTELLE 1234'],
    },
    {
      id: 'fuel_station',
      name: 'Tankstelle',
      tag: 'fuel',
      keywords: ['Tankstelle'],
      examples: ['Freie Tankstelle Mustermann'],
    },
    {
      id: 'deutsche_bahn',
      name: 'Deutsche Bahn',
      tag: 'public_transport',
      keywords: ['DB Vertrieb', 'Deutsche Bahn', 'DB Fernverkehr', 'DB BAHN'],
      examples: ['DB Vertrieb GmbH Fahrkarte', 'Deutsche Bahn Ticket'],
    },
    {
      id: 'bvg',
      name: 'BVG',
      tag: 'public_transport',
      keywords: ['BVG'],
      examples: ['BVG Berlin Abo'],
    },
    {
      id: 'mvg',
      name: 'MVG',
      tag: 'public_transport',
      keywords: ['MVG'],
      examples: ['MVG Muenchen Ticket'],
    },
    {
      id: 'hvv',
      name: 'HVV',
      tag: 'public_transport',
      keywords: ['HVV'],
      examples: ['HVV Hamburg Deutschlandticket'],
    },
    {
      id: 'parking',
      name: 'Parkhaus',
      tag: 'parking',
      keywords: ['Parkhaus', 'Parkgarage'],
      examples: ['Parkhaus Zentrum//Muenchen/DE', 'Parkgarage am Markt'],
    },

    // Health & insurance
    {
      id: 'health_insurance',
      name: 'Krankenkasse',
      tag: 'health_insurance',
      keywords: ['Krankenkasse', 'Krankenversicherung', 'AOK', 'BARMER', 'DAK-Gesundheit', 'IKK', 'BKK'],
      examples: ['Techniker Krankenkasse Beitrag', 'AOK Bayern Beitrag 04/2026'],
    },
    {
      id: 'huk_coburg',
      name: 'HUK-COBURG',
      tag: 'insurance',
      keywords: ['HUK-COBURG'],
      examples: ['HUK-COBURG Versicherung 123/456'],
    },
    {
      id: 'devk',
      name: 'DEVK',
      tag: 'insurance',
      keywords: ['DEVK'],
      examples: ['DEVK Versicherungen'],
    },
    {
      id: 'liability_insurance',
      name: 'Haftpflichtversicherung',
      tag: 'insurance',
      keywords: ['Haftpflicht', 'Haftpflichtversicherung'],
      examples: ['Beitrag Haftpflichtversicherung 2026'],
    },
    {
      id: 'mcfit',
      name: 'McFIT',
      tag: 'fitness',
      keywords: ['MCFIT'],
      examples: ['McFIT GmbH Mitgliedsbeitrag'],
    },
    {
      id: 'urban_sports_club',
      name: 'Urban Sports Club',
      tag: 'fitness',
      keywords: ['URBAN SPORTS'],
      examples: ['Urban Sports GmbH'],
    },

    // Personal care
    {
      id: 'dm',
      name: 'dm-drogerie markt',
      tag: 'drugstore',
      keywords: ['DM DROGERIE', 'DM-DROGERIE', 'DM FIL'],
      examples: ['DM Drogerie Markt 1234', 'DM-Drogerie Markt GmbH'],
    },
    {
      id: 'rossmann',
      name: 'Rossmann',
      tag: 'drugstore',
      keywords: ['ROSSMANN'],
      examples: ['ROSSMANN 1234'],
    },
    {
      id: 'mueller',
      name: 'Müller',
      tag: 'drugstore',
      // "Müller" alone is a common surname
      keywords: ['Müller Drogerie', 'Mueller Drogerie', 'Müller Handels', 'Mueller Handels'],
      examples: ['Müller Drogerie', 'Mueller Handels GmbH 123'],
    },

    // Shopping
    {
      id: 'zalando',
      name: 'Zalando',
      tag: 'clothing',
      keywords: ['ZALANDO'],
      examples: ['Zalando SE'],
    },
    {
      id: 'mediamarkt',
      name: 'MediaMarkt',
      tag: 'electronics',
      keywords: ['MEDIAMARKT', 'MEDIA MARKT'],
      examples: ['MediaMarkt 1234'],
    },
    {
      id: 'saturn',
      name: 'Saturn',
      tag: 'electronics',
      keywords: ['SATURN'],
      examples: ['SATURN ELECTRO 123'],
    },
    {
      id: 'tedi',
      name: 'TEDi',
      tag: 'general_stores',
      keywords: ['TEDI'],
      examples: ['TEDi GmbH 1234'],
    },
    {
      id: 'woolworth',
      name: 'Woolworth',
      tag: 'general_stores',
      keywords: ['WOOLWORTH'],
      examples: ['WOOLWORTH GMBH 123'],
    },
    {
      id: 'fressnapf',
      name: 'Fressnapf',
      tag: 'pets',
      keywords: ['FRESSNAPF'],
      examples: ['Fressnapf 1234'],
    },

    // Finance
    {
      id: 'account_fee',
      name: 'Kontoführung',
      tag: 'bank_fees',
      keywords: ['Kontoführung', 'Kontofuehrung', 'Kontoführungsentgelt', 'Kontoführungsgebühr'],
      examples: ['Entgelt Kontoführung 03/2026'],
    },
    {
      id: 'trade_republic',
      name: 'Trade Republic',
      tag: 'investments',
      keywords: ['TRADE REPUBLIC'],
      examples: ['Trade Republic Bank GmbH Einzahlung'],
    },
    {
      id: 'scalable_capital',
      name: 'Scalable Capital',
      tag: 'investments',
      keywords: ['SCALABLE CAPITAL'],
      examples: ['Scalable Capital GmbH'],
    },
    {
      id: 'tax_office',
      name: 'Finanzamt',
      tag: 'tax',
      keywords: ['Finanzamt', 'Bundeskasse'],
      examples: ['Finanzamt Musterstadt StNr 123/456/78901', 'Bundeskasse Kfz-Steuer'],
    },

    // Transfers
    {
      id: 'card_settlement',
      name: 'Kreditkartenabrechnung',
      tag: 'card_settlement',
      keywords: ['Visa-Kartenabrechnung', 'Summe Monatsabrechnung Visa-Karte', 'Kreditkartenabrechnung'],
      examples: ['Visa-Kartenabrechnung', 'Summe Monatsabrechnung Visa-Karte'],
    },
    {
      id: 'own_account_transfer',
      name: 'Umbuchung',
      tag: 'own_account_transfer',
      keywords: ['Umbuchung', 'Übertrag'],
      examples: ['Umbuchung auf Tagesgeld'],
    },
  ],
})
