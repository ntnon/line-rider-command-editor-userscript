// Entry point for the UI components

// eslint-disable-next-line no-unused-vars
function InitComponentClass() {
  const { store, React } = window;

  return class CommandEditorComponent extends React.Component {
    constructor() {
      super();

      this.state = {
        active: false,
        initialized: false,
        actionPanelState: {},
        activeTab: null,
        triggerData: {},
        focuserDropdownIndices: [],
        skinEditorState: {},
        settings: {},
        unsavedSettings: {},
      };

      this.computed = {
        invalidTimes: [],
        riderCount: 1,
      };

      this.componentManager = new ComponentManager(React.createElement, this);
      this.commandEditor = new CommandEditor(store, this.state);

      store.subscribeImmediate(() => {
        const { initialized } = this.state;
        if (initialized) {
          this.onAdjustFocuserDropdown();
          this.onAdjustSkinDropdown();
        }
      });

      store.subscribe(() => {
        const riderCount = Selectors.getNumRiders(store.getState());

        if (this.computed.riderCount !== riderCount) {
          this.computed.riderCount = riderCount;
        }

        const sidebarOpen = Selectors.getSidebarOpen(store.getState());

        if (sidebarOpen) {
          this.setState({ active: false });
        }

        const playerRunning = Selectors.getPlayerRunning(store.getState());
        const windowFocused = Selectors.getWindowFocused(store.getState());

        const shouldBeVisible = window.CMD_EDITOR_DEBUG || (!playerRunning && windowFocused);

        document.getElementById(Constants.ROOT_NODE_ID).style.opacity = shouldBeVisible ? 1 : 0;
        document.getElementById(Constants.ROOT_NODE_ID).style.pointerEvents = shouldBeVisible ? null : 'none';
      });
    }

    // Rendering events that handle the basic React component rendering

    componentDidMount() {
      Object.assign(document.getElementById(Constants.ROOT_NODE_ID).style, Styles.root);
      this.onInitializeState().then(() => {
        this.setState({ initialized: true });
        this.setState({ active: window.CMD_EDITOR_DEBUG });
      });
    }

    componentWillUpdate(_, nextState) {
      this.commandEditor.onUpdate(nextState);
    }

    // Trigger editing actions, follows a Create-Update-Delete structure

    onCreateTrigger(index) {
      const { triggerData, activeTab } = this.state;
      const commandData = triggerData[activeTab];
      const newTrigger = structuredClone(commandData.triggers[index]);

      const currentIndex = Selectors.getPlayerIndex(store.getState());
      newTrigger[0] = [
        Math.floor(currentIndex / 2400),
        Math.floor((currentIndex % 2400) / 40),
        Math.floor(currentIndex % 40),
      ];

      commandData.triggers.splice(index + 1, 0, newTrigger);

      this.setState({ triggerData }, this.onAdjustFocuserDropdown());
    }

    onUpdateTrigger(valueChange, path, constraints, bounded = false) {
      const { triggerData, activeTab } = this.state;
      let pathPointer = triggerData[activeTab];

      for (let i = 0; i < path.length - 1; i += 1) {
        pathPointer = pathPointer[path[i]];
      }

      pathPointer[path[path.length - 1]] = Validator.validateData(
        valueChange,
        constraints,
        bounded,
      );

      this.setState({ triggerData });
    }

    onDeleteTrigger(index) {
      const { triggerData, activeTab } = this.state;

      triggerData[activeTab].triggers = triggerData[activeTab].triggers.filter(
        (_, i) => index !== i,
      );

      this.setState({ triggerData }, this.onAdjustFocuserDropdown());
    }

    // Interaction events, used when a UI component needs to change the state

    onRead() {
      const { actionPanelState } = this.state;
      try {
        if (actionPanelState.hasError) {
          actionPanelState.message = '';
        }

        const readInformation = this.commandEditor.load();
        this.setState({ triggerData: readInformation }, this.onAdjustFocuserDropdown());
        actionPanelState.hasError = false;
      } catch (error) {
        actionPanelState.message = `Error: ${error.message}`;
        actionPanelState.hasError = true;
      }

      this.setState({ actionPanelState });
    }

    onTest(overrideTab = null) {
      const { activeTab, actionPanelState } = this.state;
      const targetTab = overrideTab || activeTab;
      try {
        this.commandEditor.test(targetTab);
        actionPanelState.hasError = false;
      } catch (error) {
        actionPanelState.message = `Error: ${error.message}`;
        actionPanelState.hasError = true;
      }

      this.setState({ actionPanelState });
    }

    onPrint() {
      const { activeTab, actionPanelState } = this.state;
      try {
        actionPanelState.message = this.commandEditor.print(activeTab);
        actionPanelState.hasError = false;
      } catch (error) {
        actionPanelState.message = `Error: ${error.message}`;
        actionPanelState.hasError = true;
      }

      this.setState({ actionPanelState });
    }

    onResetSkin(index) {
      const confirmReset = window.confirm('Are you sure you want to reset the current rider\'s skin?');

      if (confirmReset) {
        const { triggerData } = this.state;

        triggerData.CustomSkin.triggers[index] = structuredClone(
          Constants.TRIGGER_PROPS[Constants.TRIGGER_TYPES.SKIN].TEMPLATE,
        );

        this.setState({ triggerData });
      }
    }

    onChangeColor(color, alpha) {
      const { skinEditorState } = this.state;

      const hexAlpha = alpha
        ? Math.round(Math.min(Math.max(parseFloat(alpha), 0), 1) * 255)
          .toString(16).padStart(2, '0')
        : skinEditorState.color.substring(7);

      const hexColor = color
        ? color + hexAlpha
        : skinEditorState.color.substring(0, 7) + hexAlpha;

      skinEditorState.color = hexColor;

      this.setState({ skinEditorState });
    }

    onCopyClipboard() {
      const { actionPanelState } = this.state;

      if (actionPanelState.hasError) {
        console.error('Error copying text to clipboard: ', actionPanelState.message);
      }

      window.navigator.clipboard.writeText(actionPanelState.message)
        .then(() => {
          console.log('Text copied to clipboard successfully');
        })
        .catch((error) => {
          console.error('Error copying text to clipboard: ', error);
        });
    }

    onActivate() {
      const { active } = this.state;
      const sidebarOpen = Selectors.getSidebarOpen(store.getState());
      if (active) {
        this.setState({ active: false });
      } else {
        if (sidebarOpen) {
          store.dispatch(Actions.closeSidebar());
        }
        this.setState({ active: true });
      }
    }

    onChangeTab(tabName) {
      this.setState({ activeTab: tabName });
    }

    onToggleSettings(active) {
      const { unsavedSettings, settings } = this.state;

      if (!active && unsavedSettings.dirty) {
        if (!window.confirm('Discard changes?')) {
          return;
        }
        Object.assign(unsavedSettings, settings);
        unsavedSettings.dirty = false;
        this.setState({ unsavedSettings });
      }

      settings.active = active;

      this.setState({ settings });
    }

    onChangeFontSize(fontSize) {
      const { unsavedSettings, settings } = this.state;

      if (fontSize !== settings.fontSize) {
        unsavedSettings.dirty = true;
      }

      unsavedSettings.fontSize = fontSize;
      this.setState({ unsavedSettings });
    }

    onChangeViewport(resolution) {
      const { unsavedSettings, settings } = this.state;

      if (resolution !== settings.resolution) {
        unsavedSettings.dirty = true;
      }

      unsavedSettings.resolution = resolution;

      this.setState({ unsavedSettings });
    }

    onSaveViewport(oldResolution, newResolution) {
      const { triggerData } = this.state;

      const factor = Math.log2(
        Constants.SETTINGS.VIEWPORT[newResolution].SIZE[0]
        / Constants.SETTINGS.VIEWPORT[oldResolution].SIZE[0],
      );

      const size = Constants.SETTINGS.VIEWPORT[oldResolution].SIZE;
      this.commandEditor.changeViewport({ width: size[0], height: size[1] });

      triggerData[Constants.TRIGGER_TYPES.ZOOM].triggers.forEach((_, i) => {
        triggerData[Constants.TRIGGER_TYPES.ZOOM].triggers[i][1] = Math.round((
          triggerData[Constants.TRIGGER_TYPES.ZOOM].triggers[i][1] + factor + Number.EPSILON
        ) * 10e6) / 10e6;
      });

      this.setState({ triggerData });
    }

    onApplySettings() {
      const { unsavedSettings, settings } = this.state;

      this.onSaveViewport(settings.resolution, unsavedSettings.resolution);

      Object.keys(Constants.INIT_SETTINGS).forEach((setting) => {
        settings[setting] = unsavedSettings[setting];
      });

      unsavedSettings.dirty = false;

      this.setState({ settings });
      this.setState({ unsavedSettings });
    }

    onChangeFocuserDropdown(index, value) {
      const { focuserDropdownIndices } = this.state;
      focuserDropdownIndices[index] = parseInt(value, 10);
      this.setState({ focuserDropdownIndices });
    }

    onChangeSkinDropdown(value) {
      const { skinEditorState } = this.state;
      skinEditorState.dropdownIndex = parseInt(value, 10);
      this.setState({ skinEditorState });
    }

    onAdjustFocuserDropdown() {
      const { triggerData } = this.state;
      const focusTriggers = triggerData[Constants.TRIGGER_TYPES.FOCUS].triggers;
      const clamp = this.computed.riderCount;

      focusTriggers.forEach((e, i) => {
        for (let j = focusTriggers[i][1].length; j < clamp; j += 1) {
          focusTriggers[i][1] = [...focusTriggers[i][1], 0];
        }

        for (let j = focusTriggers[i][1].length; j > clamp; j -= 1) {
          focusTriggers[i][1] = focusTriggers[i][1].slice(0, -1);
        }
      });

      triggerData[Constants.TRIGGER_TYPES.FOCUS].triggers = focusTriggers;
      this.setState({ triggerData });

      const { focuserDropdownIndices } = this.state;

      for (let i = focuserDropdownIndices.length; i < focusTriggers.length; i += 1) {
        focuserDropdownIndices.push(0);
      }

      if (focuserDropdownIndices.length > focusTriggers.length) {
        focuserDropdownIndices.length = focusTriggers.length;
      }

      focuserDropdownIndices.forEach((e, i) => {
        if (focuserDropdownIndices[i] >= clamp) {
          focuserDropdownIndices[i] = clamp - 1;
        }
      });

      this.setState({ focuserDropdownIndices });
    }

    onAdjustSkinDropdown() {
      const { triggerData } = this.state;
      let skinTriggers = triggerData[Constants.TRIGGER_TYPES.SKIN].triggers;
      const clamp = this.computed.riderCount;

      for (let j = skinTriggers.length; j < clamp; j += 1) {
        skinTriggers = [...skinTriggers, structuredClone(
          Constants.TRIGGER_PROPS[Constants.TRIGGER_TYPES.SKIN].TEMPLATE,
        )];
      }

      for (let j = skinTriggers.length; j > clamp; j -= 1) {
        skinTriggers = skinTriggers.slice(0, -1);
      }

      triggerData[Constants.TRIGGER_TYPES.SKIN].triggers = skinTriggers;
      this.setState({ triggerData });

      const { skinEditorState } = this.state;

      if (skinEditorState.dropdownIndex >= clamp) {
        skinEditorState.dropdownIndex = clamp - 1;
      }

      this.setState({ skinEditorState });
    }

    onZoomSkinEditor(event, isMouseAction) {
      const rect = document.getElementById('skinElementContainer').getBoundingClientRect();
      const { skinEditorState } = this.state;

      if (isMouseAction) {
        if (skinEditorState.zoom.scale < Constants.CONSTRAINTS.SKIN_ZOOM.MAX) {
          skinEditorState.zoom.xOffset = (event.clientX - rect.x) / skinEditorState.zoom.scale;
          skinEditorState.zoom.yOffset = (event.clientY - rect.y) / skinEditorState.zoom.scale;
        }
        skinEditorState.zoom.scale = Math.max(Math.min(
          skinEditorState.zoom.scale - event.deltaY * Constants.SCROLL_DELTA,
          Constants.CONSTRAINTS.SKIN_ZOOM.MAX,
        ), Constants.CONSTRAINTS.SKIN_ZOOM.MIN);
      } else {
        skinEditorState.zoom.scale = Math.max(Math.min(
          event.target.value,
          Constants.CONSTRAINTS.SKIN_ZOOM.MAX,
        ), Constants.CONSTRAINTS.SKIN_ZOOM.MIN);
      }

      this.setState({ skinEditorState });
    }

    // State initialization, populates the triggers with base data

    async onInitializeState() {
      this.setState({ activeTab: Constants.TRIGGER_TYPES.ZOOM });
      this.setState({ triggerData: this.commandEditor.parser.commandData });
      this.setState({ focuserDropdownIndices: [0] });
      this.setState({
        actionPanel: {
          hasError: false,
          message: '',
        },
      });
      this.setState({
        skinEditorState: {
          dropdownIndex: 0,
          zoom: { scale: 1 },
          color: '#000000ff',
        },
      });
      this.setState({
        settings: {
          ...Constants.INIT_SETTINGS,
          active: false,
        },
      });
      this.setState({
        unsavedSettings: {
          ...Constants.INIT_SETTINGS,
          dirty: false,
        },
      });
    }

    updateComputed() {
      const { triggerData, activeTab } = this.state;
      if (activeTab !== Constants.TRIGGER_TYPES.SKIN) {
        this.computed.invalidTimes = Validator.validateTimes(triggerData[activeTab]);
      }
    }

    render() {
      const { initialized } = this.state;
      if (!initialized) return false;

      this.updateComputed();

      this.componentManager.updateState(this.state);
      this.componentManager.updateComputed(this.computed);

      return this.componentManager.main();
    }
  };
}
