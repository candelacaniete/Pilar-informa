import { useEffect } from 'react'

export default function JsonLd({ data }) {
  const serialized = JSON.stringify(data)

  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.jsonld = 'guia-pilar'
    script.text = serialized
    document.head.appendChild(script)
    return () => {
      script.remove()
    }
  }, [serialized])

  return null
}
