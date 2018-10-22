const InputForm = { 
  template: `
    <div class="input-form">
      <form @submit="submitForm" class="ui form">
        <div class="field">
          <label>New Item</label>
          <input :value="newItem"
            name="NEW_ITEM"
            @input="onInputChange"
            type="text" 
            placeholder="Add an item!" />
          <span style="float: right">{{ newItemLength }}/20</span>
          <span style="color: red">{{ fieldErrors.newItem }}</span>
          <span v-if="isNewItemInputLimitExceeded"
            style="color: red; display: block">
            Must be under twenty characters
          </span>
        </div>
        <div class="field">
          <label>Email</label>
          <input 
            :value="email"
            @input="onInputChange"
            name="EMAIL"
            type="text" placeholder="What's your email?" />
          <span style="color: red">{{ fieldErrors.email }}</span>
        </div>
        <div class="field">
          <label>Urgency</label>
          <select 
            :value="urgency"
            @change="onInputChange"
            name="URGENCY"
            class="ui fluid search dropdown">
            <option disabled value="">Please select one</option>
            <option>Nonessential</option>
            <option>Moderate</option>
            <option>Urgent</option>
          </select>
          <span style="color: red">{{ fieldErrors.urgency }}</span>
          <span style="color: red; display:block" 
            v-if="isNotUrgent">
            Must be moderate to urgent
          </span>
        </div>
        <div class="field">
          <div class="ui checkbox">
            <input 
              type="checkbox"
              name="TERMS_AND_CONDITIONS"
              @change="onInputChange"
              :checked="termsAndConditions" />
            <label>I accept the terms and conditions</label>
            <span style="color: red">{{ fieldErrors.termsAndConditions }}</span>
          </div>
        </div>
        <button 
          v-if="saveStatus === 'SAVING'"
           class="ui button" disabled>
          Saving...
        </button>
        <button 
          v-if="saveStatus === 'SUCCESS'"
           class="ui button"
           :disabled="isNewItemInputLimitExceeded || isNotUrgent">
          Saved! Submit another
        </button>
        <button 
          v-if="saveStatus === 'ERROR'"
           class="ui button"
           :disabled="isNewItemInputLimitExceeded || isNotUrgent">
          Save Failed - Retry?
        </button>
        <button 
          v-if="saveStatus === 'READY'"
           class="ui button"
           :disabled="isNewItemInputLimitExceeded || isNotUrgent">
          Submit
        </button>
      </form>
      <div class="ui segment">
        <h4 class="ui header">Items</h4>
        <ul>
          <div v-if="loading" class="ui active inline loader"></div>
          <li v-for="item in items" class="item">{{ item }}</li>
        </ul>
      </div>
    </div>`,
  methods: {
    submitForm(evt) {
      evt.preventDefault();

      this.fieldErrors = this.validateForm(this.$store.state.fields)
      if(Object.keys(this.fieldErrors).length) return

      const items = [...this.$store.state.items, this.$store.state.fields.newItem]

      this.saveStatus = 'SAVING'
      this.$store.dispatch('saveItems', items)
        .then(() => this.saveStatus = 'SUCCESS')
        .catch((err) => {
          console.log(err)
          this.saveStatus = 'ERROR'
        })
    },
    validateForm(fields) {
      const errors = {}
      if(!fields.newItem) errors.newItem = 'New Item required!'
      if(!fields.email) errors.email = 'Email required!'
      if(!fields.urgency) errors.urgency = 'Urgency required!'
      if(!fields.termsAndConditions) {
        errors.termsAndConditions = 'Terms and conditions have to be approved!'
      }

      if (fields.email && !this.isEmail(fields.email)) {
        errors.email = 'Invalid email'
      }
      return errors
    },
    isEmail(email) {
      const re = /\S+@\S+\.\S+/
      return re.test(email)
    },
    onInputChange(evt) {
      const element = evt.target
      const value = element.name === 'TERMS_AND_CONDITIONS' 
        ? element.checked : element.value
      this.$store.commit(`UPDATE_${element.name}`, value)
    }
  },
  data() {
    return {
      fieldErrors: {
        newItem: undefined,
        email: undefined,
        urgency: undefined,
        termsAndConditions: undefined
      },
      loading: false,
      saveStatus: 'READY'
    }
  },
  computed: Vuex.mapGetters({
    newItem: 'newItem',
    newItemLength: 'newItemLength',
    isNewItemInputLimitExceeded: 'isNewItemInputLimitExceeded',
    email: 'email',
    urgency: 'urgency',
    isNotUrgent: 'isNotUrgent',
    termsAndConditions: 'termsAndConditions',
    items: 'items'
  })
}

new Vue({
  el: '#app',
  store,
  components: {
    'input-form': InputForm
  }
})
