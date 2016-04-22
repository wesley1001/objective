/**
 * Created by Layman(http://github.com/anysome) on 16/4/22.
 */

import React from 'react'
import {View, StyleSheet} from 'react-native'
import RootSiblings from 'react-native-root-siblings'
import Spinner from 'react-native-spinkit';

import {colors} from '../views/styles'

const style = StyleSheet.create({
  container: {
    top: 20,
    right: 5,
    bottom: 5,
    left: 5,
    backgroundColor: colors.dark1,
    borderRadius: 10,
    opacity: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

let indicator = null;

export default class ActivityIndicator {

  static show() {
    indicator || (
      indicator = new RootSiblings(
        <View style={style.container}>
          <Spinner isVisible={true} size={100} type={'ChasingDots'} color={colors.accent}/>
        </View>
      )
    );
  }

  static hide() {
    indicator && indicator.destroy() || (indicator = null);
  }
}
