import api from './client'

export interface DevoirSummary {
  id: number
  titre: string
  matiere_detectee: string | null
  type_devoir: string | null
  format_sortie: string
  statut: string
  created_at: string
}

export interface DevoirDetail extends DevoirSummary {
  contenu_original: string
  consignes_detectees: string | null
  reponse_generee: string | null
  fichier_resultat: string | null
  updated_at: string
}

export const uploadDevoir = async (file: File, titre: string, formatOverride?: string, niveauOverride?: string): Promise<DevoirDetail> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('titre', titre)
  if (formatOverride) formData.append('format_override', formatOverride)
  if (niveauOverride) formData.append('niveau_override', niveauOverride)
  const res = await api.post('/devoirs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export const listDevoirs = async (): Promise<DevoirSummary[]> => {
  const res = await api.get('/devoirs/')
  return res.data
}

export const getDevoir = async (id: number): Promise<DevoirDetail> => {
  const res = await api.get(`/devoirs/${id}`)
  return res.data
}

export const downloadDevoir = async (id: number, titre: string, format: string): Promise<void> => {
  const res = await api.get(`/devoirs/${id}/download`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${titre}.${format}`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export const deleteDevoir = async (id: number): Promise<void> => {
  await api.delete(`/devoirs/${id}`)
}

export const relancerDevoir = async (id: number): Promise<DevoirDetail> => {
  const res = await api.post(`/devoirs/${id}/relancer`)
  return res.data
}
