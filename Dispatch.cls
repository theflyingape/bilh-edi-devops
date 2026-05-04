/// REST API dispatcher for HCIE needs
/// authored by Robert Hurst 21-Feb-2025
/// 
/// /api/hcie requires %DB_HSCUSTOM, %DB_IRISSYS and %SQL application roles
/// CSPSystem requires %DB_HSCUSTOM access (https://wrc.intersystems.com/wrc/eucustprob2.csp?OBJID=999056)
/// %SQL role requires table %SYS.ProcessQuery and procedure SYS.Mirror.MemberStatusList added
/// ... and Linux autofs must be running
Class API.Dispatch Extends %CSP.REST
{

Parameter CHARSET = "utf-8";

Parameter GNUPGHOME = "env GNUPGHOME=/files/etc/gpg";

/// web session is preserved across REST calls must be DISABLED
Parameter UseSession As Integer = 0;

/// https://docs.intersystems.com/iris20241/csp/docbook/DocBook.UI.Page.cls?KEY=GREST_specification#GREST_specification_cors_config
Parameter HandleCorsRequest = 1;

XData UrlMap [ XMLNamespace = "https://hciedev.laheyhealth.org/api/hcie/urlmap" ]
{
<Routes>
	<Route Url="/" Method="GET" Call="API" Cors="false" />
	<Route Url="/" Method="POST" Call="API" Cors="false" />
	<Route Url="/openapi" Method="GET" Call="OpenAPI" Cors="true"/>
	<Route Url="/test" Method="GET" Call="Test" Cors="false" />
	<Route Url="/test/:echo" Method="GET" Call="Test" Cors="false" />
	<Route Url="/test/:echo" Method="DELETE" Call="Test" Cors="false" />
	<Route Url="/test/:echo" Method="POST" Call="Test" Cors="false" />
	<Route Url="/test/:echo" Method="PUT" Call="Test" Cors="false" />
	<Route Url="/account/:id" Method="GET" Call="Account" Cors="false" />
	<Route Url="/account/:id" Method="DELETE" Call="Account" Cors="false" />
	<Route Url="/account/:id" Method="UPDATE" Call="Account" Cors="false" />
	<Route Url="/user/:id" Method="GET" Call="User" Cors="false" />
	<Route Url="/status" Method="GET" Call="Status" Cors="false" />
	<Route Url="/processes" Method="GET" Call="Processes" Cors="false" />
	<Route Url="/productions" Method="GET" Call="Productions" Cors="false" />
	<Route Url="/interfaces/:namespace" Method="GET" Call="BusinessHosts" Cors="false" />
	<Route Url="/fastfetch" Method="GET" Call="FastFetch" Cors="false" />
	<Route Url="/filestat" Method="POST" Call="FileStat" Cors="false" />
	<Route Url="/getent/:net" Method="GET" Call="getent" Cors="false" />
	<Route Url="/gpg" Method="GET" Call="gpg" Cors="false" />
	<Route Url="/gpg" Method="POST" Call="gpg" Cors="false" />
	<Route Url="/gpg/:id" Method="DELETE" Call="gpg" Cors="false" />
	<Route Url="/gpg/:id" Method="UPDATE" Call="gpg" Cors="false" />
</Routes>
}

ClassMethod OnHandleCorsRequest(url As %String) As %Status
{
	;set ^["HSCUSTOM"]cors($zh)=url_"|"_$Get(%request.CgiEnvs("HTTP_ORIGIN"))_"|"_$Get(%request.CgiEnvs("HTTP_AUTHORIZATION"))
	;set %request.CgiEnvs("HTTP_ORIGIN") = "*"
    Quit ..HandleDefaultCorsRequest(url)
}

/// invoke: https://hciedev.laheyhealth.org/api/hcie/openapi
/// source: https://community.intersystems.com/post/rest-api-swagger-intersystems-iris
ClassMethod OpenAPI() As %Status
{
	do ##class(%REST.Impl).%SetContentType("application/json")

	set sc = ##class(%REST.API).GetWebRESTApplication(, "/api/hcie", .swagger)

	if $$$ISERR(sc) {
		quit sc  // If an error occurred, exit the method
	}

	write swagger.%ToJSON()
	quit $$$OK
}

ClassMethod setError(exp) As %String
{
	// if exp.%IsA("%Exception.SQL")
	set error = "error "_ exp.Code _" :: "_ exp.Name
	if (exp.Data '= "") set error = error _" :: "_ exp.Data
	if (exp.Location '= "") set error = error _" :: "_ exp.Location
	quit error
}

ClassMethod ljArray(src As %List) As %DynamicArray
{
	try {
		set result = {}.%FromJSON("[""" _$lts(src, """,""")_ """]")
	}
	catch (err) {
		set result = []
	}
	quit result
}

/// API directory listing
ClassMethod API() As %Status
{
	write "<h1>REST API :: <a href="_%request.CgiEnvs("REQUEST_URI")_"> HCIE " _ ##class(Common.Util.EDI).#RUNLEVEL _ "</a></h1>",!
	write "<blockquote>optional append <b>?debug</b> to dump both CSP request (with any sent POST/PUT payload content) and session objects</blockquote>",!

	//	test
	write "<h3>&nbsp; /test/{echo}</h3>",!
	write "<blockquote>returns echo</blockquote>",!

	//	user
	write "<h3>&nbsp; /user/{id}</h3>",!
	write "<blockquote>returns user profile properties</blockquote>",!

	//	status
	write "<h3>&nbsp; /status</h3>",!
	write "<blockquote>returns this instance operational status</blockquote>",!

	//	processes
	write "<h3>&nbsp; /processes</h3>",!
	write "<blockquote>returns summary of each Production Namespace process run state</blockquote>",!

	do ..Debug()
	quit $$$OK
}

/// appends some formatted trace information to return stream
ClassMethod Debug()
{
	// only if this is CSP dispatched from a non-production system
	quit:'$IsObject(%request)!(##class(Common.Util.EDI).#RUNLEVEL = "LIVE")

	if (%session.Debug) || ($get(%request.CgiEnvs("QUERY_STRING")) = "debug") {
		set %response.ContentType = "text/html"
		write "<hr>",!
		write "[", $zdt($h,3), "] ", $SYSTEM, "<br>",!
		write "Web: ", %request.CgiEnvs("SERVER_SOFTWARE"), "<br>",!
		write "CSP: ", %request.GatewayInstanceName, " (", %request.GatewayConnectionName, ") build ", %request.GatewayBuild, "<br>",!
		write "<hr>",!

		write "<b>", %request.CgiEnvs("REQUEST_METHOD"), " ", %request.CgiEnvs("REQUEST_SCHEME"), "://", %request.CgiEnvs("SERVER_NAME"), %request.CgiEnvs("REQUEST_URI"), "</b><br>",!

		write "<pre>",!
		if (%request.CgiEnvs("CONTENT_LENGTH")) {
			write "Content sent: ",!
			write %request.Content.Read(),!!
		}
		zwrite %request
		write !
		zwrite %session
		write "</pre>",!
	}
}

/// simple CRUD echo test: GET, DELETE, POST, PUT
ClassMethod Test(echo As %String) As %Status
{
	/**
	 * @api {get} /test/:echo Echo (get)
	 * @apiName EchoGet
	 * @apiGroup Test
	 * @apiVersion 0.1.1
	 * @apiDescription returns stored ^Test.Echo data
	 *
	 * @apiParam {String} echo pass 'first', 'last', or an id#
	 * @apiSuccess {String} data fetch data stored
	 * @apiSuccess {String} read id#
	 */
	 /**
	 * @api {delete} /test/:echo Echo (delete)
	 * @apiName EchoDelete
	 * @apiGroup Test
	 * @apiVersion 0.1.1
	 * @apiDescription deletes stored ^Test.Echo data
	 *
	 * @apiParam {String} echo  pass 'first', 'last', or an id#
	 * @apiSuccess {String} data fetch data stored
	 * @apiSuccess {String} removed id# deleted
	 */
	 /**
	 * @api {post} /test/:echo Echo (post)
	 * @apiName EchoPost
	 * @apiGroup Test
	 * @apiVersion 0.1.1
	 * @apiDescription stores new ^Test.Echo data
	 *
	 * @apiParam {String} echo pass data to store
	 * @apiSuccess {String} data store new data
	 * @apiSuccess {String} created new id#
	 */
	/**
	 * @api {put} /test/:echo Echo (put)
	 * @apiName EchoPut
	 * @apiGroup Test
	 * @apiVersion 0.1.1
	 * @apiDescription replaces stored ^Test.Echo with new data
	 *
	 * @apiParam {String} echo pass data to replace
	 * @apiSuccess {String} data update data in last record
	 * @apiSuccess {String} updated last id#
	 */
	if $d(echo) {
		set %response.ContentType = "application/json"
		set payload = {}
		if $d(%request) set payload.command = %request.CgiEnvs("REQUEST_METHOD")
		set payload.got = echo

		if payload.command = "DELETE" {
			set i = $s(echo = "first" : $o(^Test.Echo("")), echo = "last" : $o(^Test.Echo(""), -1), 1 : +echo)
			if (i) && $d(^Test.Echo(i)) {
				set payload.data = $g(^(i))
				kill ^(i)
				set payload.removed = i
			}
			else {
				set payload.error = $s(i : "?id not found :: " _ i, 1 : "?no record found")
			}
		}

		if payload.command = "GET" {
			set i = $s(echo = "first" : $o(^Test.Echo("")), echo = "last" : $o(^Test.Echo(""), -1), 1 : +echo)
			if (i) && $d(^Test.Echo(i)) {
				set payload.data = ^(i)
				set payload.read = i
			}
			else {
				set payload.error = $s(i : "?id not found :: " _ i, 1 : "?no record found")
			}
		}

		if payload.command = "POST" {
			set i = $i(^Test.Echo)
			set ^Test.Echo(i) = echo
			set payload.data = ^(i)
			set payload.created = i
		}

		if payload.command = "PUT" {
			set i = $o(^Test.Echo(""), -1)
			if (i) && $d(^Test.Echo(i)) {
				set ^(i) = echo
				set payload.data = ^(i)
				set payload.updated = i
			}
			else {
				set payload.error = $s(i : "?id not found :: " _ i, 1 : "?no record found")
			}
		}

		write payload.%ToJSON()
	}
	else {
		set %response.ContentType = "text/html"
		if $d(%request) write %request.CgiEnvs("REQUEST_METHOD")," "
		write "<b>Test Echo</b> -- send 'first', 'last', or id# -- dumping global</br>",!
		write "<pre>",!
		zwrite ^Test.Echo
		write "</pre>",!
	}

	do ..Debug()
	quit $$$OK
}

/// 	team account properties
ClassMethod Account(id As %String) As %Status
{
	/**
	 * @api {get} /account/:id User (get)
	 * @apiName AccountGet
	 * @apiGroup Security
	 * @apiVersion 1.0.0
	 * @apiDescription returns ^AD properties
	 *
	 * @apiParam {String} username account id or "@" for all
	 * @apiSuccess {JSON} account properties
	 */
	if $d(id) {
		set %response.ContentType = "application/json"
		set payload = { "status":"OK", "data":{} }

		if $d(%request) set command = %request.CgiEnvs("REQUEST_METHOD")

		//	grant Security.Roles_List Procedure to %SQL role
		set ns = $namespace set $namespace = "%SYS"
		set statement = ##class(%SQL.Statement).%New()
		set status = statement.%Prepare("SELECT Name FROM Security.Roles_List() WHERE Name %MATCHES '[A-Z]*_DEV' OR Name %MATCHES '[A-Z]*_GUEST' OR Name %MATCHES '[A-Z]*_OPS' ORDER BY Name")
		set result = statement.%Execute()
		set interops = [], prior = ""
		while result.%Next() {
			set role = result.%Get("Name")
			set hs = $p(role, "_", 1), scope = $p(role, "_", 2)
			if (hs '= prior) {
				set prior = hs
				do interops.%Push({ "hs":(hs), "scope":[(scope)] })
			}
			else {
				set l = interops.%Size()
				do interops.%Get(l - 1).scope.%Push(scope)
			}
		}
		do result.%Close()
		kill result, statement

		if $g(command) = "GET" {
			if id = "@" {
				set payload.data = {}
				for {
					set id = $o(^["HSCUSTOM"]AD(id)) quit:id=""
					set user = $$fetch(id)
					if (user.name = "") && (user.enabled = 0) continue
					do payload.data.%Set(id, user)
				}
			}
			else {
				set payload.data = $$fetch(id)
			}
			write payload.%ToJSON()
		}
		if $g(command) = "UPDATE" {
			if (id '= "@") && ($data(^["HSCUSTOM"]AD(id))) {
				try {
					set content = {}
					if (%request.CgiEnvs("CONTENT_LENGTH")) {
						set sent = %request.Content.Read()
						set content = {}.%FromJSON(sent)
						kill hs set roles = ""
						; sort by hs to ensure consistent role list construction
						for i = 0:1:content.access.%Size() - 1 {
							set hs = content.access.%Get(i).hs, scope = content.access.%Get(i).value
							set hs(hs) = scope
						}
						set hs = ""
						for i = 0:1:content.access.%Size() - 1 {
							set hs = $o(hs(hs)), scope = hs(hs)
							if (scope '= "") {
								set role = hs_"_"_scope
								set $li(roles, *+1) = role
							}
						}
						set ^["HSCUSTOM"]AD(id, "hs") = roles
						; only allow update of LOCAL groups and HOME namespace for now
						do access(id)
						if (content.irisadm '= irisadm) {
							if (content.irisadm) {
								;set status = ##class(Security.Users).AddToGroup(id, "irisadm")
								if ($zf(-1, "sudo groupmems -a " _ id _ " -g irisadm")) {
									set payload.error = "failed to add user to irisadm group on host"
								}
								else {
									set $li(groups, *+1) = "irisadm"
								}
							}
							else {
								;set status = ##class(Security.Users).RemoveFromGroup(id, "irisadm")
								if ($zf(-1, "sudo groupmems -d " _ id _ " -g irisadm")) {
									set payload.error = "failed to drop user from irisadm group on host"
								}
								set i = $lf(groups, "irisadm")
								if (i) set $li(groups, i, i) = ""
							}
							set ^["HSCUSTOM"]AD(id) = groups
						}
						if (content.irisdev '= irisdev) {
							if (content.irisdev) {
								;set status = ##class(Security.Users).AddToGroup(id, "irisdev")
								if ($zf(-1, "sudo groupmems -a " _ id _ " -g irisdev")) {
									set payload.error = "failed to add user to irisdev group on host"
								}
								else {
									set $li(groups, *+1) = "irisdev"
								}
							}
							else {
								;set status = ##class(Security.Users).RemoveFromGroup(id, "irisdev")
								if ($zf(-1, "sudo groupmems -d " _ id _ " -g irisdev")) {
									set payload.error = "failed to drop user from irisdev group on host"
								}
								set i = $lf(groups, "irisdev")
								if (i) set $li(groups, i, i) = ""
							}
							set ^["HSCUSTOM"]AD(id) = groups
						}
						if (content.sysadm '= sysadm) {
							if (content.sysadm) {
								;set status = ##class(Security.Users).AddToGroup(id, "sysadm")
								if ($zf(-1, "sudo groupmems -a " _ id _ " -g sysadm")) {
									set payload.error = "failed to add user to sysadm group on host"
								}
								else {
									set $li(groups, *+1) = "sysadm"
								}
							}
							else {
								;set status = ##class(Security.Users).RemoveFromGroup(id, "sysadm")
								if ($zf(-1, "sudo groupmems -d " _ id _ " -g sysadm")) {
									set payload.error = "failed to drop user from sysadm group on host"
								}
								set i = $lf(groups, "sysadm")
								if (i) set $li(groups, i, i) = ""
							}
							set ^["HSCUSTOM"]AD(id) = groups
						}
						set ns = content.namespace
						if (ns '= "") set ^["HSCUSTOM"]AD(id, "ns") = ns
					}
					else {
						set payload.error = "no content sent for update"
					}
				}
				catch exp {
					set payload.status = "ERR"
					set payload.error = ..setError(exp)
				}
			}
			else {
				set payload.status = "ERR"
				set payload.error = "?invalid account id for update"
			}
			write payload.%ToJSON()
		}
		if $g(command) = "DELETE" {
			if (id '= "@") && ($data(^["HSCUSTOM"]AD(id))) {
				kill ^["HSCUSTOM"]AD(id)
				set payload.removed = id
				set status = ##class(Security.Users).Delete(id)
			}
			else {
				set payload.error = "?invalid account id for delete"
			}
			write payload.%ToJSON()
		}
		set $namespace = ns
	}
	else {
		set %response.ContentType = "text/html"
		if $d(%request) write %request.CgiEnvs("REQUEST_METHOD")," "
		write "<b>User</b> -- missing user account id</br>",!
	}
	do ..Debug()
	quit $$$OK

	//	load all of the selectable interoperability roles
interop()
	set interop = ""
	set sql = "SELECT Name FROM Security.Roles_List() WHERE Name LIKE ? ESCAPE '\'"
	set ^["HSCUSTOM"]rob("sql")=sql
	for scope = "DEV", "OPS", "GUEST" {
		set statement = ##class(%SQL.Statement).%New()
		set status = statement.%Prepare(sql)
		set result = statement.%Execute("%\_" _scope)
		while result.%Next() {
			set role = result.%Get("Name")
			set $li(interop, *+1) = role
		}
	}
	quit interop

	//	load an IRIS account into user
fetch(id)
	do access(id)
	set user = {}
	set user.id = id
	set user.groups = ..ljArray(groups)
	do user.%Set("irisdev", irisdev, "boolean")
	do user.%Set("irisadm", irisadm, "boolean")
	do user.%Set("sysadm", sysadm, "boolean")
	set user.access = access
	set user.namespace = $g(^["HSCUSTOM"]AD(id, "ns"))

	set old = $namespace set $namespace = "%SYS"
	set status = ##class(Security.Users).Get(id, .props)
	set $namespace = old
	if (status = $$$OK) {
		set user.name = props("FullName")
		set user.comment = $s(props("Comment") = props("FullName"):"", 1:props("Comment"))
		do user.%Set("enabled", props("Enabled"), "boolean")
		set user.lastlogin = props("LoginDateTime")
		if (user.namespace = "") set user.namespace = props("NameSpace")
	}
	else {
		set user.name = ""
		set user.comment = ""
		do user.%Set("enabled", 0, "boolean")
		set user.lastlogin = "never"
		set user.namespace = ""
	}
	if (user.namespace = "") {
		set user.namespace = "USER"
	}
	quit user

access(id)
	try {
		set groups = $g(^["HSCUSTOM"]AD(id))
		;
		set irisdev = $lf(groups, "irisdev") > 0
		set irisadm = $lf(groups, "irisadm") > 0
		set sysadm = $lf(groups, "sysadm") > 0
		;
		set access = []
		set hs = $g(^(id, "hs"))
		set hsRoles = $s(hs = "":[], 1:..ljArray(hs))
		for i = 0:1:hsRoles.%Size() - 1 {
			set hs = $p(hsRoles.%Get(i), "_", 1)
			set scope = $p(hsRoles.%Get(i), "_", 2)
			do access.%Push({ "hs":(hs), "value":(scope), "items":[] })
		}
		for i = 0:1:interops.%Size() - 1 {
			set hs = interops.%Get(i).hs
			set items = interops.%Get(i).scope
			set found = 0
			for j = 0:1:access.%Size() - 1 {
				if (access.%Get(j).hs = hs) {
					set access.%Get(j).items = items
					set found = j + 1
				}
			}
			//	backfill any missing interop roles for this user
			if 'found {
				do access.%Push({ "hs":(hs), "value":(""), "items":(items) })
			}
		}
	}
	catch exp {
		set payload.status = "ERR"
		set payload.error = ..setError(exp)
	}
	quit
}

/// get user account properties
/// useful for authentication/authorization need
ClassMethod User(id As %String) As %Status
{
	/**
	 * @api {get} /user/:id User (get)
	 * @apiName UserGet
	 * @apiGroup Security
	 * @apiVersion 1.0.0
	 * @apiDescription returns Security.User properties
	 *
	 * @apiParam {String} username account id
	 * @apiSuccess {JSON} account properties
	 */
	if $d(id) {
		set %response.ContentType = "application/json"
		set payload = {}

		if $d(%request) set command = %request.CgiEnvs("REQUEST_METHOD")

		if $g(command) = "GET" {
			new $namespace set $namespace = "%SYS"
			set status = ##class(Security.Users).Get(id, .props)
			if status {
				set key = ""
				for {
					set key = $o(props(key)) quit:key=""
					if (key '?1"Invalid".e) && (key '?1"LastModified".e) && (key '?1"Salt".e) do payload.%Set(key, props(key))
				}
				set payload.Groups = ..ljArray($get(^["HSCUSTOM"]AD(id)))
				set payload.Roles = [] for ea = 1:1:$l(props("Roles"), ",") do payload.Roles.%Push($p(props("Roles"), ",", ea))
			}
			else {
				set payload.CreateUsername = id
				set payload.Enabled = 0
				set payload.Groups = "[]"
				set payload.Roles = "[]"
			}
			write payload.%ToJSON()
		}
	}
	else {
		set %response.ContentType = "text/html"
		if $d(%request) write %request.CgiEnvs("REQUEST_METHOD")," "
		write "<b>User</b> -- missing user account id</br>",!
	}

	do ..Debug()
	quit $$$OK
}

/// get this instance operational status
ClassMethod Status() As %Status
{
	/**
	 * @api {get} /status/
	 * @apiName StatusGet
	 * @apiGroup Operations
	 * @apiVersion 1.0.0
	 * @apiDescription returns Mirroring and Production states
	 */
	set %response.ContentType = "application/json"
	set payload = { "status":"OK", "hostName":(##class(%SYS.System).GetNodeName()), "instance":(##class(Common.Util.EDI).#INSTANCE), "systemMode":($SYSTEM.Version.SystemMode()) }

	if $d(%request) set command = %request.CgiEnvs("REQUEST_METHOD")

	if $g(command) = "GET" {
		new $namespace set $namespace = "%SYS"
		set mirrorStatus = ##class(SYS.Mirror).GetFailoverMemberStatus(.this, .other)
		set payload.memberStatus = ..ljArray(this)
		set payload.otherStatus = ..ljArray($get(other))
		try {
			set tStatement = ##class(%SQL.Statement).%New()
			set status = tStatement.%PrepareClassQuery("SYS.Mirror", "MemberStatusList")
			if status '= 1 throw ##class(%Exception.StatusException).CreateFromStatus(status)
			set rs = tStatement.%Execute(), members=[]
			if rs.%SQLCODE throw ##class(%Exception.SQL).%New(,rs.%SQLCODE,,rs.%Message)
			while rs.%Next() {
				do members.%Push({ "memberName":(rs.%Get("MemberName")), "currentRole":(rs.%Get("CurrentRole")), "currentStatus":(rs.%Get("CurrentStatus")), "journalLatency":(rs.%Get("JournalLatency")), "databaseLatency":(rs.%Get("DatabaseLatency")), "journalTimeLatency":(rs.%Get("JournalTimeLatency")), "databaseTimeLatency":(rs.%Get("DatabaseTimeLatency")), "displayType":(rs.%Get("DisplayType")), "displayStatus":(rs.%Get("DisplayStatus")) })
			}
			do rs.%Close()
			set payload.mirrorStatus = members
			; last nightly archive folder: /files rotation and production exports
			set bck = "date -r `ls -td /files/Archive/2* | head -1`"
			set payload.lastArchive = "none"
			open bck:"qr":5
			if $TEST use bck read date set payload.lastArchive = date
			close bck
			; last database backup
			set bck = "date -r `ls -t /mnt/autofs/hcie_bck/" _##class(Common.Util.EDI).#INSTANCE_ "/AutoBackupFull_*.bck | head -1`"
			set payload.lastBackup = "none"
			open bck:"qr":5
			if $TEST use bck read date set payload.lastBackup = date
			close bck
		}
		catch exp {
			set payload.status = "ERR"
			set payload.error = ..setError(exp)
		}
	}

	write payload.%ToJSON()
	do ..Debug()
	quit $$$OK
}

/// get summary of each Production Namespace process run state
ClassMethod Processes() As %Status
{
	/**
	 * @api {get} /processes/
	 * @apiName ProcessesGet
	 * @apiGroup Operations
	 * @apiVersion 1.0.0
	 * @apiDescription summarize each Production Namespace process run state
	 */
	set %response.ContentType = "application/json"
	set payload = { "status":"OK", "hostName":(##class(%SYS.System).GetNodeName()), "instance":(##class(Common.Util.EDI).#INSTANCE), "systemMode":($SYSTEM.Version.SystemMode()) }

	if $d(%request) set command = %request.CgiEnvs("REQUEST_METHOD")

	if $g(command) = "GET" {
		new $namespace set $namespace = "%SYS"
		do ##class(%SYS.Ensemble).GetStatusAll(.ensemble)
		set ns = "", productions = [], running = $lb(), n = 0
		for {
			set ns = $o(ensemble(ns)) quit:ns=""
			set class = $li(ensemble(ns), 1)
			set state = $li(ensemble(ns), 2)
			if state '= "Running" continue
			set n = n + 1, $li(running, n) = ns
		}
		if (n) {
			set RunType = $lb("File", "Net", "Queue")
			try {
				set tStatement = ##class(%SQL.Statement).%New()
				set status = tStatement.%Prepare("SELECT NameSpace, $Piece(Routine,'.',2) AS RunType, $Piece(CurrentDevice,'|',2) AS NET, COUNT(*) AS Total"
				_" FROM %SYS.ProcessQuery WHERE NameSpace %INLIST ?"
				_" GROUP BY NameSpace, $Piece(Routine,'.',2), $Piece(CurrentDevice,'|',2)"
				_" ORDER BY NameSpace, Routine")
				if status '= 1 throw ##class(%Exception.StatusException).CreateFromStatus(status)
				set rs = tStatement.%Execute(running)
				if rs.%SQLCODE throw ##class(%Exception.SQL).%New(,rs.%SQLCODE,,rs.%Message)
				set (item, lastNS) = ""
				while rs.%Next() {
					set ns = rs.%Get("NameSpace")
					if (ns '= lastNS) {
						if $IsObject(item) do productions.%Push(item)
						set item = { "Production":(ns), "File":0, "Net":0, "Queue":0 }
						set lastNS = ns
					}
					set rt = rs.%Get("RunType")
					set net = rs.%Get("NET")
					set n = rs.%Get("Total")
					if (net = "") {
						if (rt '= "Queue") set rt = "File"
					}
					else {
						set rt = "Net"
					}
					if '$lf(RunType, rt) set rt = "Misc"
					set n = item.%Get(rt, n) + n
					do item.%Set(rt, n)
				}
				do rs.%Close()
				if $IsObject(item) do productions.%Push(item)
				set payload.productions = productions
			}
			catch exp {
				set payload.status = "ERR"
				set payload.error = ..setError(exp)
			}
		}
	}

	write payload.%ToJSON()
	do ..Debug()
	quit $$$OK
}

/// get list of running Productions
ClassMethod Productions() As %Status
{
	/**
	 * @api {get} /productions/
	 * @apiName ProductionsGet
	 * @apiGroup Operations
	 * @apiVersion 1.0.0
	 * @apiDescription enumerate each Production Namespace in this instance
	 */
	set %response.ContentType = "application/json"
	set payload = { "status":"OK", "hostName":(##class(%SYS.System).GetNodeName()), "instance":(##class(Common.Util.EDI).#INSTANCE), "systemMode":($SYSTEM.Version.SystemMode()) }

	if $d(%request) set command = %request.CgiEnvs("REQUEST_METHOD")

	if $g(command) = "GET" {
		set payload.productions = []
		try {
			do ##class(%SYS.Ensemble).GetStatusAll(.productions)
			set ns = ""
			for {
				set ns = $o(productions(ns)) quit:ns=""
				set class = $li(productions(ns), 1)
				set state = $li(productions(ns), 2)
				if (state = "Running") {
					do payload.productions.%Push(ns)
				}
			}
		}
		catch exp {
			set payload.status = "ERR"
			set payload.error = ..setError(exp)
		}
	}

	write payload.%ToJSON()
	do ..Debug()
	quit $$$OK
}

/// query matching criteria on business host name and/or configs
ClassMethod BusinessHosts(namespace As %String) As %Status
{
	/**
	 * @api {get} /interfaces/:namespace
	 * @apiName BusinessHostsGet
	 * @apiGroup Operations
	 * @apiVersion 1.0.0
	 * @apiDescription query matching criteria on business host name and/or configs
	 */
	set %response.ContentType = "application/json"
	set payload = { "status":"OK", "hostName":(##class(%SYS.System).GetNodeName()), "instance":(##class(Common.Util.EDI).#INSTANCE), "systemMode":($SYSTEM.Version.SystemMode()) }

	if $d(%request) set command = %request.CgiEnvs("REQUEST_METHOD")

	if $g(command) = "POST" {
		try {
			new $namespace
			set $namespace = namespace
			
		}
		catch exp {
			set payload.status = "ERR"
			set payload.error = ..setError(exp)
		}
	}

	write payload.%ToJSON()
	do ..Debug()
	quit $$$OK
}

ClassMethod FastFetch() As %Status
{
	/**
	 * @api {get} /fastfetch
	 * @apiName FileStat
	 * @apiGroup Operations
	 * @apiVersion 1.0.0
	 * @apiDescription retrieve fastfetch metadata off this host
	 */
	set %response.ContentType = "application/json"
	set payload = { "status":"OK", "hostName":(##class(%SYS.System).GetNodeName()), "instance":(##class(Common.Util.EDI).#INSTANCE), "systemMode":($SYSTEM.Version.SystemMode()) }

	if $d(%request) set command = %request.CgiEnvs("REQUEST_METHOD")

	if $g(command) = "GET" {
		set content = ""
		set fastfetch = "fastfetch --format json 2> /dev/null"
		try {
			open fastfetch:"qr":2 use fastfetch
			for { read line set content = content_line_$c(10) }
		}
		catch exp {
			close fastfetch
			if (exp.Name = "<ENDOFFILE>") {
				set payload.content = {}.%FromJSON(content)
			}
			else {
				set payload.status = "ERR"
				set payload.error = ..setError(exp)
			}
		}
	}

	write payload.%ToJSON()
	do ..Debug()
	quit $$$OK
}

ClassMethod FileStat() As %Status
{
	/**
	 * @api {POST} /filestat
	 * @apiName FileStat
	 * @apiGroup Operations
	 * @apiVersion 1.0.0
	 * @apiDescription retrieve filesystem metadata off a name
	 */
	set %response.ContentType = "application/json"
	set payload = { "status":"OK", "hostName":(##class(%SYS.System).GetNodeName()), "instance":(##class(Common.Util.EDI).#INSTANCE), "systemMode":($SYSTEM.Version.SystemMode()) }

	if $d(%request) set command = %request.CgiEnvs("REQUEST_METHOD")

	if $g(command) = "POST" {
		try {
			set content = {}
			if (%request.CgiEnvs("CONTENT_LENGTH")) {
				set sent = %request.Content.Read()
				set content = {}.%FromJSON(sent)
			}
			set fileName = content.fileName
			if (fileName '= "") {
				set stat = "stat -L --printf='%s %A %U %G %Y %N[[%F]]' '"_ fileName _"' 2> /dev/null"
				open stat:"qr":5
				if $TEST use stat read metaInfo
				close stat

				set payload.size = +$p(metaInfo, " ", 1)
				set payload.permissions = $p(metaInfo, " ", 2)
				set payload.owner = $p(metaInfo, " ", 3)
				set payload.group = $p(metaInfo, " ", 4)
				set payload.modified = $p(metaInfo, " ", 5) * 1000
				set payload.fileName = $p($p(metaInfo, " ", 6, *), "[[")
				set payload.type = $p($p(metaInfo, "[[", *), "]]")
			}
		}
		catch exp {
			set payload.status = "ERR"
			set payload.error = ..setError(exp)
		}
	}

	write payload.%ToJSON()
	do ..Debug()
	quit $$$OK
}

ClassMethod getent(net As %String = "localhost") As %Status
{
	/**
	 * @api {get} /getent/:net
	 * @apiName hostname lookup
	 * @apiGroup Operations
	 * @apiVersion 1.0.0
	 * @apiDescription retrieve IP and hostname against this host's resolver configuration
	 */
	set %response.ContentType = "application/json"
	set payload = { "status":"OK", "hostName":(##class(%SYS.System).GetNodeName()), "instance":(##class(Common.Util.EDI).#INSTANCE), "systemMode":($SYSTEM.Version.SystemMode()) }

	if $d(%request) set command = %request.CgiEnvs("REQUEST_METHOD")

	if $g(command) = "GET" {
		try {
			set lookup = "getent hosts '"_ net _"' 2> /dev/null"
			open lookup:"qr":5
			if $TEST use lookup read result
			close lookup

			set payload.result = {}
			if (result '= "") {
				set payload.result.ip = $p(result, " ")
				set payload.result.hosts = ..ljArray($lfs($tr($ZSTRIP($p(result, " ", 2, *), "<W"), " ", ","), ","))
			}

			try {
				set nmap = "nmap '"_ net _"' 2> /dev/null"
				open nmap:"qr":5
				set results = ""
				if $TEST {
					use nmap
					for {
						read line
						set results = results_line_$c(10)
					}
				}
			}
			catch exp {
				close nmap
				if (exp.Name = "<ENDOFFILE>") {
					set payload.result.nmap = results
				}
				else {
					set payload.status = "ERR"
					set payload.error = ..setError(exp)
				}
			}
		}
		catch exp {
			close lookup
			if (exp.Name = "<ENDOFFILE>") {
				set payload.error = "no results from DNS lookup"
			}
			else {
				set payload.status = "ERR"
				set payload.error = ..setError(exp)
			}
		}
	}

	write payload.%ToJSON()
	do ..Debug()
	quit $$$OK
}

ClassMethod gpg(id As %String) As %Status
{
	/**
	 * @api {get} /gpg
	 * @apiName gpg key list
	 * @apiGroup Operations
	 * @apiVersion 1.0.0
	 * @apiDescription retrieve GPG keys available on this host
	 */
	set %response.ContentType = "application/json"
	set payload = { "status":"OK", "hostName":(##class(%SYS.System).GetNodeName()), "instance":(##class(Common.Util.EDI).#INSTANCE), "systemMode":($SYSTEM.Version.SystemMode()) }

	if $d(%request) set command = %request.CgiEnvs("REQUEST_METHOD")

	if $g(command) = "GET" {
		try {
			set payload.data = []
			set ring = ..#GNUPGHOME _" gpg -k --with-colons 2> /dev/null | grep -A2 ^pub:u"
			open ring:"qr":5
			if $TEST {
				set (id, fingerprint) = ""
				for {
					use ring read gpg
					set segment = $p(gpg, ":")
					if (segment = "pub") {
						set trust = $p(gpg, ":", 2)
						set id = $p(gpg, ":", 5)
					}
					if (segment = "fpr") {
						set fingerprint = $p(gpg, ":", 10)
					}
					if (segment = "uid") && (id '= "") && (fingerprint '= "") {
						set description = $p(gpg, ":", 10)
						set name = $p(description, " <", 1)
						set comment = $p($p(name, " (", 2), ")")
						if $l(comment) set name = $p(name, " (")
						set email =$p($p(description, " <", 2), ">")
						set trust = $p(gpg, ":", 2)
						set key = { "id":(id), "fingerprint":(fingerprint), "name":(name), "comment":(comment), "email":(email), "trust":(trust), "pubkey":("") }

						//	fetch the public key block for this id if it's ultimately trusted and include in the response
						try {
							set armor = ..#GNUPGHOME _" gpg --armor --export "_ id  _" 2> /dev/null"
							open armor:"qr":5
							if $TEST {
								use armor
								for {
									read line
									set key.pubkey = key.pubkey_line_$c(10)
								}
							}
						}
						catch exp {
							close armor
							if (exp.Name '= "<ENDOFFILE>") {
								set payload.status = "ERR"
								set payload.error = ..setError(exp)
							}
						}

						do payload.data.%Push(key)
						set (id, fingerprint) = "" ; reset for next record
					}
				}
			}
		}
		catch exp {
			close ring
			if (exp.Name '= "<ENDOFFILE>") {
				set payload.status = "ERR"
				set payload.error = ..setError(exp)
			}
		}
	}

	if $g(command) = "POST" {
		try {
			set content = {}
			if (%request.CgiEnvs("CONTENT_LENGTH")) {
				set sent = %request.Content.Read()
				set content = {}.%FromJSON(sent)
			}
			//	if a public key block is included, attempt to import it and set trust to ultimately trusted, otherwise attempt to generate a new key with the provided name/email/comment
			if (content.pubkey '= "") {
				set import = ..#GNUPGHOME _" gpg --batch --import"
				open import:"q":5
				if $TEST {
					use import
					write content.pubkey, $c(4) ; EOT to signal end of key block
					read gpg
					close import
					set id = $p($p(gpg, ": ", 2), "key ", 2)
					set payload.id = id
					set payload.result = $zf(-1, "(echo 5; echo y; echo save) | "_ ..#GNUPGHOME _" gpg --batch --command-fd 0 --edit-key """_ id _""" trust")
					set payload.result = $zf(-1, "(echo adduid; echo '"_ content.name _"'; echo '"_ content.email _"'; echo '"_ content.comment _"'; echo O; echo uid 1; echo deluid; echo y; echo primary; echo save) | "_ ..#GNUPGHOME _" gpg --batch --command-fd 0 --edit-key """_ id _"""")
				}
				else {
					set payload.status = "ERR"
					set payload.error = "could not open gpg process for import"
				}
			}
			else {
				set import = ..#GNUPGHOME _" gpg --batch --passphrase '' --quick-gen-key """ _ content.name _" (" _ content.comment _") <"_ content.email _">"" default default never"
				open import:"qr":5
				if $TEST {
					use import
					read gpg
					close import
					set id = $p($p($p(gpg, ": ", 2), "key ", 2), " ")
					set payload.id = id
					set payload.result = gpg
				}
				else {
					set payload.status = "ERR"
					set payload.error = "could not open gpg process to generate new key"
				}
			}
		}
		catch exp {
			if $d(import) close import
			set payload.status = "ERR"
			set payload.error = ..setError(exp)
		}
	}

	if ($g(command) = "DELETE") && ($g(id) '= "") {
		set payload.cmd = "sudo "_ ..#GNUPGHOME _" gpg --batch --yes --delete-secret-keys "_ id _" 2> /dev/null"
		set payload.result = $zf(-1, payload.cmd)
		set payload.cmd =..#GNUPGHOME _" gpg --batch --yes --delete-keys "_ id _" 2> /dev/null"
		set payload.result = $zf(-1, payload.cmd)
	}

	if ($g(command) = "UPDATE") && ($g(id) '= "") {
		try {
			set content = {}
			if (%request.CgiEnvs("CONTENT_LENGTH")) {
				set sent = %request.Content.Read()
				set content = {}.%FromJSON(sent)
			}
			set payload.cmd = "(echo adduid; echo '"_ content.name _"'; echo '"_ content.email _"'; echo '"_ content.comment _"'; echo O; echo uid 1; echo deluid; echo y; echo primary; echo save) | sudo "_ ..#GNUPGHOME _" gpg --batch --command-fd 0 --edit-key """_ content.fingerprint _""" 2> /dev/null"
			set payload.result = $zf(-1, payload.cmd)
		}
		catch exp {
			set payload.status = "ERR"
			set payload.error = ..setError(exp)
		}
	}

	write payload.%ToJSON()
	do ..Debug()
	quit $$$OK
}

}
