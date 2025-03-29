// @ts-expect-error missing types
import syslog from 'modern-syslog'
syslog.open('DevOps')

//  syslog wrapper
export function log(priority:string|number, message:string, loglevel:string|number = 'LOG_NOTICE') {
    if (isNaN(+loglevel)) loglevel = syslog.level[loglevel]
    syslog.upto(loglevel)
    syslog.log(priority, message)
}
/*
syslog.level are listed from highest to lowest priority:
    LOG_EMERG:      System is unusable
    LOG_ALERT:      Action must be taken immediately
    LOG_CRIT:       Critical condition
    LOG_ERR:        Error condition
    LOG_WARNING:    Warning condition
    LOG_NOTICE:     Normal, but significant, condition
    LOG_INFO:       Informational message
    LOG_DEBUG:      Debug-level message
*/
