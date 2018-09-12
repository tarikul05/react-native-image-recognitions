import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Camera, Permissions, ImagePicker } from 'expo';
import Api from './Api'

export default class CameraExample extends React.Component {
  constructor(props) {
    super(props)
  
    this.state = {
      photo: '',
      base64: '',
      api_key: '9CpiJ8ViRAtQSLnjUV99HQA_h2phfSbd',
      api_secret: '94jtPpbyAcEic9kNJn0KUP1RmeCSa5Tn'
    };
  };



  _pickImage = async () => {
    console.log('Pick image')
    const camPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    console.log(camPermission)
    if(camPermission.status == 'granted'){
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        mediaTypes:'Images',
        aspect: [4, 3],
        base64: true,
      }).catch(error => console.log(camPermission, { error }));

      // console.log(result);

      if (!result.cancelled) {
        this.setState({ photo: result.uri, base64: result.base64 });
        this._detectImage()
      }
    }else{
      console.log("Permission is denied, Please give the camera permission")
    }
    
  };

  _detectImage = async () => {
    console.log('Detect image')
    const uri = this.state.photo;
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    // let formData = new FormData();
    // formData.append('image_file', {
    //   uri,
    //   name: `photo.${fileType}`,
    //   type: `image/${fileType}`,
    // });


    const reqUrl = '/detect?api_key='+this.state.api_key+'&api_secret='+this.state.api_secret
                  // +'&=image_base64'+this.state.base64


  
    Api.fetch(reqUrl, {
      method: 'POST',
      body: {
        image_base64: this.state.base64
      },
      // headers: {
      //   'Content-Type': 'multipart/form-data',
      // },
    }).then((data)=>{
      console.log(data)
    }).then(()=>{
      // this.props.navigation.navigate('Wikilist')
    }).catch((error)=>{
      console.log("error:", error)
      alert(error)
    })
 
  };

  _addNewImage = async () => {
    console.log('Add New Image')
 
  };

  render() {
    return (
      <View style={{alignItems: 'center', flex:1, flexDirection: 'column', alignItems:"center", alignContent:"center", justifyContent:"center"}}>
          {
            this.state.photo ? 
              <Image 
              source = {{ uri: this.state.photo }} 
              style={{width: 300, height: 300}} 
              />
            :
              <Image 
              // source = {{ uri: './../assets/profile-icon.png' }} 
              source = { require('./assets/icon.png') }
              style={{width: 300, height: 300}} 
              />
          }
          <View>
            <Text style={ { marginTop:80, fontSize:30 }}
            onPress={this._pickImage}
            >
              Upload Image
            </Text>

            <Text style={ { marginTop:80, fontSize:30 }}
            onPress={this._searchImage}
            >
              Verify image
            </Text>
          </View>
      </View>
    )
    
  }
}