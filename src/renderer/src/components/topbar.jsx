import { useEffect, useState } from 'react'

export default function TopBar() {
  const [platform, setPlatform] = useState('')

  useEffect(() => {
    // Fetch the platform using the exposed API
    window.electron.ipcRenderer.invoke('electron:platform', '').then((re) => {
      setPlatform(re)
    })
  }, [])

  const size = () => {
    if (platform === 'darwin') {
      return 'h-10'
    }
    return 'h-8'
  }

  console.log(size())

  return <div className={`w-full ${size()} bg-[#f0f0ef]`} style={{ WebkitAppRegion: 'drag' }}></div>
}
