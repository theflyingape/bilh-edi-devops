export default defineEventHandler(async (_ev) => {
  const { buildDate, version } = useAppConfig()
  return { buildDate: buildDate, version: version }
})
