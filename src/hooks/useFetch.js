import { useState, useEffect, useCallback } from 'react'

export function useFetch(apiFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await apiFn()
      const payload = Object.prototype.hasOwnProperty.call(res || {}, 'data') ? res.data : res
      setData(Object.prototype.hasOwnProperty.call(payload || {}, 'data') ? payload.data : payload)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [apiFn, ...deps])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}
