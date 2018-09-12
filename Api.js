// import Env from './Env'
// import User from '../models/User'

export default class Api {

  static buildUrl( path ) {
    // return Env.apiOrigin + "/api/v1" + path
    return "https://api-us.faceplusplus.com/facepp/v3" + path
  }

  static fetchBase( url, params ) {
    this.requestDebugPrint( url, params )
    return fetch( url, params ).then((response)=>{
      this.responseDebugPrint( response ) 
      if ( !response.ok ) {
        return response.json().then((json)=>{
          console.log(json)
          // const msg = this.apiLogicalErrorMap( json, response )
          // throw new ApiError( msg, response.status, json )
          // throw new Error( msg )
        })
        // .catch((error)=>{
        //   throw error
        //   // throw new Error(`${error}`)
        // })
      }
      return response.json()
    })
  }

  static fetch( path, params ) {
    let url = this.buildUrl( path )
    console.log('parm sri', params.body)
    if ( params.body ) {
      params.body = JSON.stringify(params.body)
      params.headers = params.headers || {}
      params.headers['Accept']        = 'application/json'
      // params.headers['Content-Type']  = 'application/json'
    }
    return this.fetchBase( url, params )
  }


  static requestDebugPrint( url, params ) {
    let method  = ''
    let headers = ''
    let bodies  = ''
    if ( params.headers ) {
      headers = Object.keys(params.headers).map((k)=>{
        return `${k}: ${params.headers[k]}`
      }).join("\" -H \"")
      if ( headers ) {
        headers = "-H \"" + headers + "\""
      }
    }
    let jsonBody = null
    if ( params.body && typeof params.body === 'string' ) {
      jsonBody = JSON.parse( params.body )
    }
    if ( params.method !== "GET" && jsonBody ) {
      method = `-X ${params.method}`
      bodies = Object.keys(jsonBody).map((key)=>{
        return `${key}=${jsonBody[key]}`
      }).join("\" -F \"")
      if ( bodies ) {
        bodies = "-F \"" + bodies + "\""
      }
    }

    console.log("fetch.curl", `curl ${method} ${headers} ${bodies} "${url}"`)
  }

  static responseDebugPrint( response ) {
    console.log("fetch.response", response)
  }

  static handleError( error ) {
    console.error( error )
  }

  static apiLogicalErrorMap( error, response ) {
    const map = {
      "F0020": "ユーザ情報に誤りがあるか、このユーザはまだ承認されていません。",
      "F0030": "入力項目に不備があります。",
    }
    if ( map[error.code] ) {
      error.message = map[error.code]
    }
    return `${error.message}, status=${response.status}`
  }
}

export class ApiError extends Error {
  constructor( message, status, json ) {
    super( message )
    this.status = status
    this.json = json
  }
}