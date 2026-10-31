/** The collapsed "how this model works" note under each public tool. */
export default function ModelNotes({ title, children }: { title: string; children: React.ReactNode }) {
  return <details className="tool-model-notes"><summary>{title} <span>+</span></summary><p>{children}</p></details>
}
