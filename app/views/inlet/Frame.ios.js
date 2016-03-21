/**
 * Created by Layman(http://github.com/anysome) on 16/2/19.
 */
'use strict';

import React, {StyleSheet, NavigatorIOS, TabBarIOS, Component} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import app from '/../app/app';


import Agenda from '../agenda/Agenda';
import Check from '../check/Check';
import Anything from './Anything';
import Me from '../me/Me';
import Discover from '../discover/Discover';


const iconSize = 28;

export default class Frame extends Component {

	constructor() {
		super();
		this.lastPage = null;
		this.state = {
			currentPage: 'Me'
		};
		this.icons = new Map();
	}

	componentWillMount() {
		// draw icon image for later use case
		['ios-box-outline', 'ios-more-outline', 'ios-plus-empty', 'ios-compose-outline', 'ios-trash-outline'].forEach(name => {
			Icon.getImageSource(name, 32).then(source => this.icons.set(name, source));
		});
	}

	componentWillUnmount() {
		console.log(`-------- Frame unmounting`);
	}

	_selectTab(tabPage) {
		if (this.state.currentPage === tabPage) {

		} else {
			this.setState({currentPage: tabPage});
			this.lastPage = null;
			app.airloy.event.emit('tab.change', tabPage);
		}
	}

	isPageActive(tabPage) {
		//console.log(`current ${this.state.currentPage} and active is ${tabPage}`);
		return this.state.currentPage === tabPage || this.lastPage === tabPage;
	}

	getIcon(iconName) {
		return this.icons.get(iconName);
	}

	_openAdd() {
		this.lastPage = this.state.currentPage;
		this.setState({currentPage: 'Anything'});
	}

	closeAdd() {
		this.setState({currentPage: this.lastPage});
		this.lastPage = null;
	}

	_renderNavigator(component, title, hideBar = false){
		return <NavigatorIOS
			style={{flex:1}}
			navigationBarHidden={hideBar}
			titleTextColor={app.colors.dark1}
			tintColor={app.colors.accent}
			translucent={true}
			includeOpaqueBars={false}
			navTintColor={app.colors.light1}
			itemWrapperStyle={style.navigation}
			initialRoute={{
				component: component,
				title: title,
				passProps:{
					frame: this,
			  	}
        	}}
		/>;
	}

	render() {
		return (
			<TabBarIOS tintColor={app.colors.accent}
					   translucent={true}>
				<Icon.TabBarItem
					title="待办"
					iconName="ios-star-outline"
					selectedIconName="ios-star"
					iconSize={iconSize}
					selected={this.state.currentPage === 'Agenda'}
					onPress={() => this._selectTab('Agenda')}>
					{this._renderNavigator(Agenda, "待办")}
				</Icon.TabBarItem>
				<Icon.TabBarItem
					title="检查单"
					iconName="ios-checkmark-outline"
					selectedIconName="android-checkmark-circle"
					iconSize={iconSize}
					selected={this.state.currentPage === 'Check'}
					onPress={() => this._selectTab('Check')}>
					{this._renderNavigator(Check, "检查单")}
				</Icon.TabBarItem>
				<Icon.TabBarItem iconName="plus-round" title={null} iconSize={36}
								 selected={this.state.currentPage === 'Anything'}
								 onPress={() => this._openAdd()}>
					<Anything onClose={() => this.closeAdd()} />
				</Icon.TabBarItem>
				<Icon.TabBarItem
					title="我"
					iconName="ios-person-outline"
					selectedIconName="ios-contact-outline"
					iconSize={iconSize}
					selected={this.state.currentPage === 'Me'}
					onPress={() => this._selectTab('Me')}>
					{this._renderNavigator(Me, "我", true)}
				</Icon.TabBarItem>
				<Icon.TabBarItem
					title="发现"
					iconName="ios-navigate-outline"
					selectedIconName="ios-navigate"
					iconSize={iconSize}
					selected={this.state.currentPage === 'Discover'}
					onPress={() => this._selectTab('Discover')}>
					{this._renderNavigator(Discover, "发现")}
				</Icon.TabBarItem>
			</TabBarIOS>
		);
	}
}

const style = StyleSheet.create({
	navigation: {
		backgroundColor: app.colors.light2
	}
});