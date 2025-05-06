export default defineEventHandler(async (event)  => {
  const { buildDate, version } = useAppConfig()
  return { buildDate: buildDate, version: version }
})
