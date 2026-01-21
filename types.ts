
export interface Stakeholder {
  id: string;
  name: string;
  region: string; 
  department: string;
  role: string;
  detail: string; 
  source: string;
  dateLogged: string;
}

export interface KBPath {
  id: string;
  name: string;
  path: string;
  type: 'local_folder';
  files: {
    name: string;
    relativePath: string; // The folder structure path (e.g. "Marketing/2024/Plan.pdf")
    data: string; // Base64 encoded data
    mimeType: string;
  }[];
}

export interface RAGSource {
  id: string;
  name: string;
  url: string;
  active: boolean;
}

export interface AgentResult {
  answerEnglish: string; 
  answerChinese: string; 
  groundingUrls: { title: string; uri: string }[];
}