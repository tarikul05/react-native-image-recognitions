import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Camera, Permissions, ImagePicker } from 'expo';
import Spinner from 'react-native-loading-spinner-overlay';
import Api from './Api'

export default class CameraExample extends React.Component {
  constructor(props) {
    super(props)
  
    this.state = {
      photo: '',
      newEntry: false,
      base64: '',
      face_token: '',
      confidence: false,
      api_key: '9CpiJ8ViRAtQSLnjUV99HQA_h2phfSbd',
      api_secret: '94jtPpbyAcEic9kNJn0KUP1RmeCSa5Tn',
      visible:false
    };
  };



  _pickImage = async () => {
    console.log('Pick image')
    this.setState({ face_token:'', confidence: '', photo:'' });

    const camPermission = await Permissions.askAsync(Permissions.CAMERA);
    console.log(camPermission)
    if(camPermission.status == 'granted'){
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        mediaTypes:'Images',
        aspect: [4, 3],
        base64: true,
      }).catch(error => console.log(camPermission, { error }));

      if (!result.cancelled) {
        this.setState({ photo: result.uri, base64: result.base64, face_token:'', confidence: '', visible:true });
        this._detectImage()
      }
    }else{
      console.log("Permission is denied, Please give the camera permission")
    }
    
  };

  _detectImage = async () => {
    console.log('Detect image')
    let formData = new FormData();
    formData.append('api_key', this.state.api_key)
    formData.append('api_secret', this.state.api_secret)
    formData.append('image_base64', this.state.base64)

      fetch('https://api-us.faceplusplus.com/facepp/v3/detect', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: formData,
      }).then((response) => response.json())
      .then((responseJson) => {
         console.log('Faces ',responseJson.faces);
         if(responseJson.faces.length > 0){
           responseJson.faces.map((face, index)=>(
             this.setState({ face_token: face.face_token })
            ));
            this._verifyImage()
         }else{
           //alert('Unable to detect any face')
           this._pickImage()
         }

      }).then((dta)=> {
        console.log('face token form state',this.state.face_token)
      })
      .catch((error) => {
        console.error(error);
      });
 
  };

  _verifyImage = async () => {
    console.log('verify image')
    let formData = new FormData();
    formData.append('api_key', this.state.api_key)
    formData.append('api_secret', this.state.api_secret)
    formData.append('faceset_token', 'caa66bbca6fec6d7ff1a62f2ffce5386')
    formData.append('face_token', this.state.face_token)

      fetch('https://api-us.faceplusplus.com/facepp/v3/search', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: formData,
      }).then((response) => response.json())
      .then((responseJson) => {
         console.log('maindata: ',responseJson);

         if(responseJson.results.length > 0){
           responseJson.results.map((res, index)=>(
             this.setState({ confidence: res.confidence, visible:false })
            ));
         }

      }).then((dta)=> {
        console.log('face token form state',this.state.face_token)
      })
      .catch((error) => {
        console.error(error);
      });
 
  };

  _addNewImage = async () => {
    this.setState({newEntry: true})

    let formData = new FormData();
    formData.append('api_key', this.state.api_key)
    formData.append('api_secret', this.state.api_secret)
    formData.append('faceset_token', 'caa66bbca6fec6d7ff1a62f2ffce5386')
    formData.append('face_tokens', this.state.face_token)
    
    fetch('https://api-us.faceplusplus.com/facepp/v3/faceset/addface', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: formData,
      }).then((response) => response.json())
      .then((responseJson) => {
         console.log('added json : ',responseJson);
        
         if(responseJson.failure_detail.length == 0){
          this.setState({ face_token: false })
           alert("Face added successfully")
         }

      }).then((dta)=> {
        console.log('face token form state',this.state.face_token)
      })
      .catch((error) => {
        console.error(error);
      });
  };

  

  checkMessage = () =>{
    if(this.state.confidence > 75 ){
      return (
        <View>
          <Text style={ { marginTop:50, fontSize:30, color:'green' }}>
            Image match. You have identified
          </Text>
        </View>
      );
    }else if(this.state.confidence < 75 && this.state.confidence > 0){
      return (
        <View>
          <Text style={ { marginTop:50, fontSize:30, color:'red' }}>
            Sorry, we didn't recognize you 
          </Text> 

          <Text style={ { marginTop:50, fontSize:30,  }}
           onPress={this._addNewImage}
          >
            Add this image
          </Text>
        </View>
      )
      
    }else{
      return(
        <View>

        </View>
      )
    }
  }

  render() {
    return (
      <View style={{alignItems: 'center', flex:1, flexDirection: 'column', alignItems:"center", alignContent:"center", justifyContent:"center"}}>
        <Spinner visible={this.state.visible} textContent={"Searching..."} textStyle={{color: '#FFF'}} />
          {
            this.state.photo ? 
              <Image 
              source = {{ uri: this.state.photo }} 
              style={{width: 300, height: 300}} 
              />
            :
              <Image 
              source = { require('./assets/splash.jpg') }
              style={{width: 300, height: 300}} 
              />
          }
          <View>
            <Text style={ { marginTop:80, fontSize:30 }}
            onPress={this._pickImage}
            >
              Upload Image
            </Text>

            {/* <Text style={ { marginTop:80, fontSize:30 }}
            onPress={this._searchImage}
            >
              Verify image
            </Text> */}

            { this.state.face_token ?
              // <Text style={ { marginTop:80, fontSize:30 }}
              // onPress={this._verifyImage}
              // >
              //   Verify image
              // </Text>
              ''
              : '' }

             { this.checkMessage() }



          </View>
      </View>
    )
    
  }
}