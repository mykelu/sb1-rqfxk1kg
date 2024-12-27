interface AssessmentMetadata {
  sourceUrl: string;
  citation: string;
  license: string;
}

export const ASSESSMENT_METADATA: Record<string, AssessmentMetadata> = {
  phq9: {
    sourceUrl: 'https://www.phqscreeners.com/select-screener/36',
    citation: 'Developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues',
    license: 'Free to use for clinical practice and research'
  },
  gad7: {
    sourceUrl: 'https://www.phqscreeners.com/select-screener/41',
    citation: 'Spitzer RL, Kroenke K, Williams JBW, Löwe B. A brief measure for assessing generalized anxiety disorder. Arch Intern Med. 2006',
    license: 'Free to use for clinical practice and research'
  },
  who5: {
    sourceUrl: 'https://www.psykiatri-regionh.dk/who-5/who-5-questionnaires/Pages/default.aspx',
    citation: 'WHO Collaborating Center for Mental Health, Psychiatric Research Unit, Mental Health Centre North Zealand',
    license: 'Free to use, available in multiple languages'
  },
  wemwbs: {
    sourceUrl: 'https://warwick.ac.uk/wemwbs',
    citation: 'Warwick-Edinburgh Mental Well-being Scale (WEMWBS) © NHS Health Scotland, University of Warwick and University of Edinburgh, 2006',
    license: 'Free to use for non-commercial purposes with permission'
  }
};