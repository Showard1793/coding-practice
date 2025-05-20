import json
import requests
url = "http://api.weatherbit.io/v2.0/current?city=St.%20Louis&state=MO&country=US&key=b76c9728ee3740c39b75747ef1dd292d"

response = requests.get(url)
data = response.json()

#print the temp in Fahrenheit
celsius = data['data'][0]['app_temp']

fahrenheit = (celsius * 9/5) +32

print("Today the temperature in St. Louis is " + str(fahrenheit) + " degrees fahrenheit")

# # Convert to JSON string
# json_string = json.dumps(data)

# # Replace commas with ",\n" for new lines
# formatted = json_string.replace(',', '\n')

# print(formatted)




