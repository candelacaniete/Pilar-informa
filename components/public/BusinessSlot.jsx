import BusinessCard from '@/components/public/BusinessCard'
import BusinessPlaceholderCard from '@/components/public/BusinessPlaceholderCard'

export default function BusinessSlot({ item }) {
  if (item.kind === 'business') {
    return <BusinessCard business={item.business} />
  }

  return <BusinessPlaceholderCard title={item.copy.title} text={item.copy.text} />
}
