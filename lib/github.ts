// GENÉRICO — copiar tal cual, sin cambios, en cualquier proyecto nuevo.
// Requiere el paquete @octokit/rest como dependencia.

import { Octokit } from '@octokit/rest'

export interface FileChange {
  /** Ruta dentro del repo, ej: "content/hero.json" */
  path: string
  /** Contenido en texto (utf-8) o en base64 (para binarios). Ignorado si deleted=true. */
  content?: string
  encoding?: 'utf-8' | 'base64'
  /** true para eliminar el archivo del árbol en este mismo commit. */
  deleted?: boolean
}

function getConfig() {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH || 'main'
  if (!token || !owner || !repo) {
    throw new Error(
      'Faltan variables de entorno: GITHUB_TOKEN, GITHUB_OWNER y GITHUB_REPO son obligatorias para guardar cambios.'
    )
  }
  return { token, owner, repo, branch }
}

/**
 * Crea UN solo commit con todos los archivos cambiados (texto e imágenes juntos)
 * usando la Git Data API de GitHub (blobs → tree → commit → mover la rama).
 * Esto es lo que dispara el redeploy automático en Vercel.
 */
export async function commitFiles(files: FileChange[], message: string) {
  if (files.length === 0) {
    throw new Error('No hay cambios que guardar.')
  }

  const { token, owner, repo, branch } = getConfig()
  const octokit = new Octokit({ auth: token })

  // 1. Referencia actual de la rama
  const { data: ref } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` })
  const latestCommitSha = ref.object.sha

  // 2. Commit y árbol base actuales
  const { data: latestCommit } = await octokit.git.getCommit({ owner, repo, commit_sha: latestCommitSha })
  const baseTreeSha = latestCommit.tree.sha

  // 3. Un blob por archivo cambiado (los eliminados no llevan blob: sha null los saca del árbol)
  const entries = await Promise.all(
    files.map(async (file) => {
      if (file.deleted) {
        return { path: file.path, sha: null as string | null }
      }
      const { data: blob } = await octokit.git.createBlob({
        owner,
        repo,
        content: file.content ?? '',
        encoding: file.encoding === 'base64' ? 'base64' : 'utf-8',
      })
      return { path: file.path, sha: blob.sha as string | null }
    })
  )

  // 4. Árbol nuevo, basado en el árbol actual + los blobs cambiados/eliminados
  const { data: newTree } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: baseTreeSha,
    tree: entries.map((e) => ({
      path: e.path,
      mode: '100644' as const,
      type: 'blob' as const,
      sha: e.sha,
    })),
  })

  // 5. Commit nuevo
  const { data: newCommit } = await octokit.git.createCommit({
    owner,
    repo,
    message,
    tree: newTree.sha,
    parents: [latestCommitSha],
  })

  // 6. Mover la rama al commit nuevo (esto es lo que Vercel detecta)
  await octokit.git.updateRef({ owner, repo, ref: `heads/${branch}`, sha: newCommit.sha })

  return {
    sha: newCommit.sha,
    htmlUrl: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
  }
}
