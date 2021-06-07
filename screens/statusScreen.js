import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  ToastAndroid,
  KeyboardAvoidingView,
} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import db from '../config';
import * as firebase from 'firebase';


export default class StatusScreen extends Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermission: null,
      scanned: false,
      scannedData: '',
      buttonState: 'normal',
       // to tell that whether the scan button has been clicked or not
      scannedBookId: '',
      scannedStudentId: '',
      transactionMessage:'',
    };
  }
  getCameraPermission = async (Id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted',
      scanned: false,
      buttonState: Id,
    });
  };
  handleBarCodeScanned = ({ type, data }) => {
    if (this.state.buttonState === 'BookId') {
      this.setState({
        scannedBookId: data,
        scanned: true, // the scanned data is recieved than need to set status true for scanned and get the button back to normal
        buttonState: 'normal',
      });
    } else if (this.state.buttonState === 'StudentId') {
      this.setState({
        scannedStudentId: data,
        scanned: true, // the scanned data is recieved than need to set status true for scanned and get the button back to normal
        buttonState: 'normal',
      });
    }
  };
  handleTransaction = async() => {
   var transactionType = await this.checkBookEligibility() //value will be either false or return or issue
   if(!transactionType) //return false then only statment will be exuted
   {
     Alert.alert('The Book Does Not Exist In The Libray Database')
     this.setState({scannedStudentId:'',scannedBookId:''})
   }
   else if(transactionType === 'issue'){
     var isStudentEligible=await this.checkStudentEligibilityForBookIssue()
       if(isStudentEligible){
this.initiateBookIssue()
Alert.alert('Book isIssued To The Student')
       }
     }
     else{
      var isStudentEligible=await this.checkStudentEligibilityForBookReturn()
      if(isStudentEligible){
this.initiateBookReturn()
Alert.alert('Book is Returned From The Student')
      }
     }
  };


  checkBookEligibility = async()=>{
const bookRef=await db.collection('book').where('bookID','==', this.state.scannedBookId).get()
var transactionType = ''
if(bookRef.docs.length === 0){
  transactionType = false;
}
else{
  bookRef.docs.map((doc)=>{
var book = doc.data()
if(book.bookAvail){
  transactionType='Issue'
}else{
  transactionType='return'
}
  })
}
return transactionType
  }



  checkStudentEligibilityForBookIssue = async()=>{
const studentRef=await db.collection('Student').where('studentID','==', this.state.scannedStudentId).get()
var isStudentEligible = ''
if (studentRef.docs.length === 0){
  this.setState({scannedStudentId:'',scannedBookId:''}) 
  isStudentEligible=false
  Alert.alert('Student ID Does Not Exist In The DataBase')
}
else{
  studentRef.docs.map((doc)=>{
var Student = doc.data()
if(Student.NoOfBKsIssued<2){
  isStudentEligible=true
  }
  else{
    isStudentEligible=false
    Alert.alert('Student Has Already Isued 2 Books')
    this.setState({scannedStudentId:'',scannedBookId:''}) 
  }
})
  }
  return isStudentEligible
  }

  checkStudentEligibilityForBookReturn = async()=>{
    const transactionRef=await db.collection('Transaction').where('bookID','==', this.state.scannedBookId).limit(1).get()
    var isStudentEligible = ''
 /*   if (studentRef.docs.length === 0){
      this.setState({scannedStudentId:'',scannedBookId:''}) 
      isStudentEligible=false
      Alert.alert('Student ID Does Not Exist In The DataBase')
    }
    else{*/
      transactionRef.docs.map((doc)=>{
    var lastBookTransaction = doc.data()
    if(lastBookTransaction.studentID === this.state.scannedStudentId){
      isStudentEligible=true
      }
      else{
        isStudentEligible=false
        Alert.alert('The Book Was Not Issued By This Student')
        this.setState({scannedStudentId:'',scannedBookId:''}) 
      }
    })
      
      return isStudentEligible
      }


  initiateBookIssue = async () => {
    db.collection('Transaction').add({
      studentID: this.state.scannedStudentId,
      bookID: this.state.scannedBookId,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: 'Issue',
    });
    db.collection('book').doc(this.state.scannedBookId).update({
      BookAvail: false,
    });

    db.collection('Student')
      .doc(this.state.scannedStudentId)
      .update({
        NoOfBKsIssued: firebase.firestore.FieldValue.increment(1),
      });
  };

  initiateBookReturn = async () => {
    db.collection('Transaction').add({
      studentID: this.state.scannedStudentId,
      bookID: this.state.scannedBookId,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: 'Return',
    });
    db.collection('book').doc(this.state.scannedBookId).update({
      BookAvail: true,
    });

    db.collection('Student')
      .doc(this.state.scannedStudentId)
      .update({
        NoOfBKsIssued: firebase.firestore.FieldValue.increment(-1),
      });
  };

  render() {
    if (this.state.buttonState !== 'normal' && this.state.hasCameraPermission) {
      return (
        // the handlebarCodeScanned function should be called only when scanned status is false
        <BarCodeScanner
          onBarCodeScanned={
            this.state.scanned ? undefined : this.handleBarCodeScanned
          }
        />
      );
    } else if (this.state.buttonState === 'normal') {
      return (
        /* if camera permission is true it need to display the data which is in scnned data document else show text as request for camera permission*/
        <KeyboardAvoidingView style={styles.container} behavior='padding'enabled>
          <Image
            source={require('../assets/booklogo.jpg')}
            style={{ width: 150, height: 150 }}
          />
          <Text style={{ alignSelf: 'center' }}>Willy App</Text>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputBox}
              placeholder="BookId"
              value={this.state.scannedBookId}
              onChangeText={(text)=>{this.setState({scannedBookId:text})}}
            />
            <TouchableOpacity
              style={styles.scannedButton}
              onPress={() => {
                this.getCameraPermission('BookId');
              }}>
              <Text style={styles.displayText}>SCAN </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputBox}
              placeholder="StudentId"
              value={this.state.scannedStudentId}
             onChangeText={(text)=>{this.setState({scannedStudentId:text})}}
            />
            <TouchableOpacity
              style={styles.scannedButton}
              onPress={() => {
                this.getCameraPermission('StudentId');
              }}>
              <Text style={styles.displayText}>SCAN </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.scannedButton}
            onPress={() => {
              this.handleTransaction();
            }}>
            <Text style={styles.displayText}>Submit </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      );
    }
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scannedButton: {
    backgroundColor: 'green',
    width: 50,
    borderWidth: 1.5,
    borderLeftWidth: 0,
  },

  inputView: {
    flexDirection: 'row',
    margin: 20,
  },
  inputBox: {
    width: 200,
    height: 40,
    borderWidth: 1.5,
    borderRightWidth: 0,
    textSize: 20,
  },
});
